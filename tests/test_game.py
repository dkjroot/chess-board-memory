import json
from collections import Counter
from threading import Thread
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, build_opener, HTTPCookieProcessor
from http.cookiejar import CookieJar

from app import Handler, ThreadingHTTPServer
from game import PIECES, STOCK, Practice


class GameTests(unittest.TestCase):
    def test_all_piece_palette_accepts_decoys_and_penalizes_extras(self):
        game = Practice()
        board = game.start({"palette": "all"})
        self.assertEqual(board["pieces"], list(PIECES))
        self.assertEqual(board["count"], 3)
        decoy = next(piece for piece in PIECES if piece not in board["position"].values())
        empty = next(sq for sq in ("a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3") if sq not in board["position"])
        result = game.check(board["id"], {**board["position"], empty: decoy})
        self.assertEqual(len(result["correct"]), 3)
        self.assertEqual(result["extra"], [empty])
        self.assertFalse(result["perfect"])
        self.assertEqual(game.streak, 0)
        board = game.start({"palette": "all"})
        square = next(iter(board["position"]))
        decoy = next(piece for piece in PIECES if piece not in board["position"].values())
        self.assertEqual(game.check(board["id"], {square: decoy})["correct"], [])

    def test_palette_does_not_change_target_or_perfect_scoring(self):
        game = Practice()
        for palette in ("all", "puzzle"):
            board = game.start({"palette": palette})
            self.assertEqual(len(board["position"]), 3)
            if palette == "puzzle":
                self.assertEqual(set(board["pieces"]), set(board["position"].values()))
            self.assertTrue(game.check(board["id"], board["position"].copy())["perfect"])

    def test_board_sizes_counts_and_material_limits(self):
        for size in range(3, 9):
            for count in (1, min(32, size * size)):
                game = Practice()
                board = game.start({"size": size, "count": count})
                self.assertEqual(len(board["position"]), count)
                self.assertLessEqual(Counter(board["position"].values()), Counter(STOCK))
                for square in board["position"]:
                    self.assertIn(square[0], "abcdefgh"[:size])
                    self.assertIn(int(square[1]), range(1, size + 1))

    def test_full_material_can_include_all_eight_pawns_and_both_minor_pieces(self):
        game = Practice()
        board = game.start({"size": 6, "count": 32, "palette": "all"})
        self.assertEqual(Counter(board["position"].values()), Counter(STOCK))
        self.assertEqual(board["inventory"], STOCK)
        self.assertTrue(game.check(board["id"], board["position"].copy())["perfect"])

    def test_duplicate_puzzle_pieces_are_interchangeable_and_inventory_is_counted(self):
        game = Practice()
        with patch("game.random.sample", side_effect=[["a1", "b1", "c1", "a2"], ["wP", "wP", "bN", "bN"]]):
            board = game.start({"count": 4})
        self.assertEqual(board["inventory"], {"wP": 2, "bN": 2})
        self.assertEqual(set(board["pieces"]), {"wP", "bN"})
        with self.assertRaisesRegex(ValueError, "more pieces"):
            game.check(board["id"], {"a1": "wP", "b1": "wP", "c1": "wP"})
        # There are no hidden identities for otherwise identical pawns/knights.
        answer = {"a2": "bN", "c1": "bN", "b1": "wP", "a1": "wP"}
        self.assertTrue(game.check(board["id"], answer)["perfect"])

    def test_full_palette_rejects_material_overuse(self):
        game = Practice()
        board = game.start({"size": 4, "palette": "all"})
        squares = [f"{col}{row}" for col in "abcd" for row in range(1, 5)]
        for piece in PIECES:
            with self.assertRaisesRegex(ValueError, "more pieces"):
                game.check(board["id"], dict.fromkeys(squares[:STOCK[piece] + 1], piece))
        # Using the permitted eight pawns is a valid (possibly wrong) answer.
        self.assertIsInstance(game.check(board["id"], dict.fromkeys(squares[:8], "wP")), dict)

    def test_progression_and_idempotent_grading(self):
        game = Practice()
        for _ in range(3):
            board = game.start({})
            result = game.check(board["id"], board["position"].copy())
            self.assertEqual(game.check(board["id"], {}), result)
        self.assertTrue(result["advanced"])
        self.assertEqual(game.size, 4)
        self.assertEqual(game.rounds, 3)
        self.assertEqual(game.streak, 0)

    def test_partial_wrong_and_empty_answer(self):
        game = Practice()
        board = game.start({})
        sq, piece = next(iter(board["position"].items()))
        result = game.check(board["id"], {sq: piece})
        self.assertEqual(result["correct"], [sq])
        self.assertFalse(result["perfect"])
        board = game.start({})
        self.assertEqual(game.check(board["id"], {})["correct"], [])
        self.assertEqual(game.streak, 0)

    def test_fixed_mode_and_maximum_board_do_not_advance(self):
        for settings in ({"size": 3, "mode": "fixed"}, {"size": 8}):
            game = Practice()
            for _ in range(4):
                board = game.start(settings)
                result = game.check(board["id"], board["position"].copy())
                self.assertFalse(result["advanced"])
            self.assertEqual(game.size, settings["size"])

    def test_settings_change_resets_streak(self):
        game = Practice()
        board = game.start({})
        game.check(board["id"], board["position"].copy())
        game.start({"size": 4})
        self.assertEqual(game.streak, 0)

    def test_invalid_settings_and_stale_round(self):
        game = Practice()
        for settings in ({"size": True}, {"size": 9}, {"size": "3"}, {"count": 10}, {"size": 8, "count": 33}, {"seconds": 0}, {"mode": "other"}, {"palette": "invalid"}):
            with self.assertRaises(ValueError):
                game.start(settings)
        old = game.start({})
        current = game.start({})
        with self.assertRaises(ValueError):
            game.check(old["id"], {})
        for answer in ([], {"z9": "wK"}, {"a1": "invalid"}, {"a1": []}):
            with self.assertRaises(ValueError):
                game.check(current["id"], answer)


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        cls.thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.client = build_opener(HTTPCookieProcessor(CookieJar()))

    def post(self, path, data):
        with self.client.open(Request(self.url + path, json.dumps(data).encode(), {"Content-Type": "application/json"})) as response:
            return json.load(response)

    def test_roundtrip_and_isolation(self):
        board = self.post("/api/start", {"size": 4})
        result = self.post("/api/check", {"id": board["id"], "placement": board["position"]})
        self.assertTrue(result["perfect"])
        self.setUp()  # A fresh browser does not share the other browser's round.
        with self.assertRaises(HTTPError) as raised:
            self.post("/api/check", {"id": board["id"], "placement": board["position"]})
        self.assertEqual(raised.exception.code, 400)

    def test_static_files_and_private_paths(self):
        for path in ("/", "/app.js", "/style.css"):
            with self.client.open(self.url + path) as response:
                self.assertEqual(response.status, 200)
                self.assertIn("frame-ancestors 'none'", response.headers["Content-Security-Policy"])
        for path in ("/game.py", "/../README.md"):
            with self.assertRaises(HTTPError) as raised:
                self.client.open(self.url + path)
            self.assertEqual(raised.exception.code, 404)

    def test_bad_json_and_foreign_origin(self):
        for payload in (b"[]", b"broken", b'{"size":9}'):
            with self.assertRaises(HTTPError) as raised:
                self.client.open(Request(self.url + "/api/start", payload))
            self.assertEqual(raised.exception.code, 400)
        with self.assertRaises(HTTPError) as raised:
            self.client.open(Request(self.url + "/api/start", b"{}", {"Origin": "https://example.org"}))
        self.assertEqual(raised.exception.code, 403)


if __name__ == "__main__":
    unittest.main()

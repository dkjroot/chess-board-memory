import unittest
from unittest.mock import patch

from chess_rules import attacked_squares, threatened_squares
from game import Practice
from questions import CATALOGUE


class ThreatVariantTests(unittest.TestCase):
    def test_friendly_blocker_is_defended_but_not_threatened(self):
        position = {"a1": "wR", "a2": "wP", "c1": "bN"}
        self.assertIn("a2", attacked_squares(position, 3, "w", "R"))
        self.assertEqual(threatened_squares(position, 3, "w", "R"), {"b1", "c1"})
        self.assertNotIn("a3", threatened_squares(position, 3, "w", "R"))

    def test_all_pieces_and_attacker_specific_symbols(self):
        position = {"a1": "wR", "a3": "bR", "c3": "bP"}
        all_pieces = CATALOGUE["pieces_all"].build(3, position)
        self.assertEqual(all_pieces.answers, {"a1": "x", "a3": "x"})
        split = CATALOGUE["pieces_both"].build(3, position)
        self.assertEqual(split.answers, {"a3": "xw", "a1": "xb"})
        self.assertEqual(set(split.markers), {"xw", "xb"})

    def test_wrong_attacker_symbol_is_wrong_even_on_the_right_square(self):
        practice = Practice(mode="threats_fixed", bag=["pieces_both"])
        with patch("game.random.sample", side_effect=[["a1", "a3", "c3"], ["wR", "bR", "bP"]]):
            board = practice.start({"mode": "threats_fixed", "count": 3})
        answers = practice.question.answers
        self.assertTrue(answers)
        wrong = {sq: "xb" if marker == "xw" else "xw" for sq, marker in answers.items()}
        result = practice.check(board["id"], wrong)
        self.assertFalse(result["perfect"])
        self.assertEqual(result["correct"], [])

    def test_question_is_not_in_start_response_and_reveal_is_stale_safe(self):
        practice = Practice()
        board = practice.start({"mode": "random_fixed"})
        self.assertNotIn("question", board)
        revealed = practice.reveal(board["id"])
        self.assertEqual(revealed, practice.reveal(board["id"]))
        self.assertNotIn("answers", revealed["question"])
        self.assertNotIn("position", revealed)
        practice.start({})
        with self.assertRaises(ValueError):
            practice.reveal(board["id"])

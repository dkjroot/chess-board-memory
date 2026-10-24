import unittest

from chess_rules import attacked_squares, attacks_from, threatened_pieces


class AttackTests(unittest.TestCase):
    def test_bishop_diagonals_and_board_edges(self):
        self.assertEqual(attacks_from({"c3": "wB"}, "c3", 5),
                         {"a1", "b2", "d4", "e5", "a5", "b4", "d2", "e1"})
        self.assertEqual(attacks_from({"a1": "bB"}, "a1", 3), {"b2", "c3"})

    def test_rays_stop_at_first_blocker_of_either_colour(self):
        position = {"a1": "wR", "a3": "wP", "c1": "bN", "a4": "bP", "d1": "bQ"}
        self.assertEqual(attacks_from(position, "a1", 4), {"a2", "a3", "b1", "c1"})
        self.assertEqual(threatened_pieces(position, 4, "w", "R"), {"c1"})

    def test_queen_combines_rook_and_bishop_rays(self):
        position = {"b2": "wQ", "b3": "wP", "c3": "bP"}
        queen = attacks_from(position, "b2", 4)
        rook = attacks_from({**position, "b2": "wR"}, "b2", 4)
        bishop = attacks_from({**position, "b2": "wB"}, "b2", 4)
        self.assertEqual(queen, rook | bishop)
        self.assertNotIn("d4", queen)

    def test_knight_jumps_over_pieces_and_stays_on_board(self):
        position = {"b1": "wN", "b2": "wP", "a2": "bP", "c2": "wP"}
        self.assertEqual(attacks_from(position, "b1", 3), {"a3", "c3"})
        self.assertEqual(len(attacks_from({"d4": "bN"}, "d4", 8)), 8)

    def test_pawns_attack_diagonally_in_opposite_directions(self):
        self.assertEqual(attacks_from({"b2": "wP"}, "b2", 3), {"a3", "c3"})
        self.assertEqual(attacks_from({"b2": "bP"}, "b2", 3), {"a1", "c1"})
        self.assertEqual(attacks_from({"a1": "wP"}, "a1", 3), {"b2"})
        self.assertEqual(attacks_from({"a3": "wP"}, "a3", 3), set())
        self.assertEqual(attacks_from({"c1": "bP"}, "c1", 3), set())

    def test_king_attacks_adjacent_squares_even_when_they_are_unsafe(self):
        self.assertEqual(attacks_from({"a1": "wK", "c3": "bR"}, "a1", 3), {"a2", "b1", "b2"})
        self.assertEqual(len(attacks_from({"b2": "bK"}, "b2", 3)), 8)

    def test_pinned_piece_still_attacks(self):
        position = {"a1": "wK", "a2": "wN", "a8": "bR"}
        self.assertIn("c3", attacked_squares(position, 8, "w", "N"))

    def test_type_filter_includes_both_bishops_and_deduplicates_overlap(self):
        position = {"a1": "bB", "c1": "bB", "b2": "wR", "a3": "bP"}
        self.assertEqual(attacked_squares(position, 3, "b", "B"), {"b2"})
        self.assertEqual(threatened_pieces(position, 3, "b", "B"), {"b2"})
        self.assertIn("b2", attacked_squares(position, 3, "b"))

    def test_friendly_square_is_defended_but_not_a_threatened_opposing_piece(self):
        position = {"a1": "wR", "a2": "wP", "c1": "bB"}
        self.assertIn("a2", attacked_squares(position, 3, "w", "R"))
        self.assertEqual(threatened_pieces(position, 3, "w", "R"), {"c1"})

    def test_all_piece_attacks_are_clipped_on_every_supported_board(self):
        for size in range(3, 9):
            for colour in "wb":
                for kind in "KQRBNP":
                    result = attacks_from({"a1": colour + kind}, "a1", size)
                    self.assertNotIn("a1", result)
                    self.assertTrue(all("a" <= square[0] < chr(97 + size) and 1 <= int(square[1:]) <= size for square in result))

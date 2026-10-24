from collections import Counter
import unittest
from unittest.mock import patch

from game import MODES, Practice
from questions import CATALOGUE, question_pool


class QuestionTests(unittest.TestCase):
    def test_every_template_builds_a_public_question_without_answer_keys(self):
        position = {"a1": "wR", "a3": "bB", "b2": "bN"}
        for key, template in CATALOGUE.items():
            question = template.build(3, position)
            self.assertEqual(question.kind, key)
            self.assertTrue(question.prompt)
            self.assertNotIn("answers", question.public())
            if question.answer_kind == "marks":
                self.assertTrue(all(value in question.markers for value in question.answers.values()))

    def test_piece_and_side_questions_compute_the_expected_targets(self):
        position = {"a1": "bR", "a3": "wB", "b2": "wN"}
        for key in ("pieces_piece", "pieces_side", "squares_piece", "squares_side"):
            with patch("questions.random.choice", return_value="bR" if key.endswith("piece") else "b"):
                question = CATALOGUE[key].build(3, position)
            expected = {"a3"} if key.startswith("pieces") else {"a2", "a3", "b1", "c1"}
            self.assertEqual(set(question.answers), expected)
            self.assertIn("Black", question.prompt)

    def test_each_question_bag_is_exhausted_before_refilling(self):
        for family in ("memory", "threats", "random"):
            practice = Practice()
            pool = question_pool(family)
            with patch("game.generate_candidate", return_value={"a1": "wR", "a3": "bR", "c2": "wN"}):
                for _ in range(3):
                    kinds = [practice.reveal(practice.start({"mode": f"{family}_fixed"})["id"])["question"]["kind"] for _ in pool]
                    self.assertEqual(Counter(kinds), Counter(pool))

    def test_empty_threat_candidate_retries_up_to_the_limit(self):
        practice = Practice()
        # One pawn cannot threaten an opposing piece if none exists.
        with patch("game.generate_candidate", return_value={"a3": "wP"}) as generate, patch("game.question_pool", return_value=["pieces_piece"]), patch("game.record_retry_limit") as log:
            with self.assertRaisesRegex(ValueError, "Try more pieces"):
                practice.start({"mode": "threats_fixed", "count": 1})
        self.assertEqual(generate.call_count, 20)
        log.assert_called_once_with("pieces_piece", 3, 1, 20)

    def test_threat_scoring_missing_extra_wrong_kind_and_repeat_submission(self):
        practice = Practice()
        with patch("game.random.sample", side_effect=[["a1", "a3"], ["bR", "wN"]]), patch("game.question_pool", return_value=["pieces_piece"]), patch("questions.random.choice", return_value="bR"):
            board = practice.start({"mode": "threats_progressive", "count": 2})
        with self.assertRaises(ValueError):
            practice.check(board["id"], {"a3": "wN"})
        with self.assertRaises(ValueError):
            practice.check(board["id"], {"z9": "x"})
        result = practice.check(board["id"], {"a3": "x", "b2": "x"})
        self.assertEqual(result["correct"], ["a3"])
        self.assertEqual(result["extra"], ["b2"])
        self.assertFalse(result["perfect"])
        self.assertEqual(practice.check(board["id"], {}), result)
        self.assertEqual(practice.rounds, 1)

    def test_progression_works_across_all_six_modes(self):
        for mode in MODES:
            practice = Practice()
            for _ in range(3):
                board = practice.start({"mode": mode})
                answer = practice.question.answers.copy()
                result = practice.check(board["id"], answer)
            self.assertEqual(practice.size, 4 if mode.endswith("progressive") else 3)
            self.assertEqual(practice.rounds, 3)

    def test_switching_family_resets_streak_and_uses_the_new_pool(self):
        practice = Practice()
        board = practice.start({})
        practice.check(board["id"], board["position"])
        board = practice.start({"mode": "threats_progressive"})
        self.assertEqual(practice.streak, 0)
        self.assertIn(practice.reveal(board["id"])["question"]["kind"], question_pool("threats"))

    def test_old_memory_mode_names_still_work(self):
        for old in ("fixed", "progressive"):
            practice = Practice()
            board = practice.start({"mode": old})
            self.assertEqual(practice.reveal(board["id"])["question"]["kind"], "memory")
            self.assertEqual(board["progress"]["mode"], f"memory_{old}")

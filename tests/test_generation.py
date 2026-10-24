import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from game import MAX_GENERATION_ATTEMPTS, Practice, generate_round
import generation_diagnostics
from questions import CATALOGUE


class GenerationTests(unittest.TestCase):
    def test_rerolls_the_same_type_until_a_nonempty_answer(self):
        empty = {"a1": "wP", "b1": "wP"}
        useful = {"a1": "wR", "a3": "bR"}
        with patch("game.generate_candidate", side_effect=[empty, useful]) as generate, patch("game.record_retry_limit") as log:
            position, question, bag = generate_round("threats_fixed", 3, 2, ["pieces_all"])
        self.assertEqual(position, useful)
        self.assertEqual(question.kind, "pieces_all")
        self.assertTrue(question.answers)
        self.assertEqual(generate.call_count, 2)
        self.assertEqual(bag, [])
        log.assert_not_called()

    def test_twentieth_attempt_is_accepted_without_logging_a_limit(self):
        with patch("game.generate_candidate", side_effect=[{"a1": "wP", "b1": "wP"}] * 19 + [{"a1": "wR", "a3": "bR"}]) as generate, patch("game.record_retry_limit") as log:
            _, question, _ = generate_round("threats_fixed", 3, 2, ["pieces_all"])
        self.assertTrue(question.answers)
        self.assertEqual(generate.call_count, MAX_GENERATION_ATTEMPTS)
        log.assert_not_called()

    def test_limit_is_logged_then_another_question_type_is_tried(self):
        # No opposing victim is possible, but a lone central pawn threatens squares.
        with patch("game.generate_candidate", return_value={"b2": "wP"}) as generate, patch("game.record_retry_limit") as log:
            _, question, _ = generate_round("threats_fixed", 3, 1, ["squares_side", "pieces_all"])
        log.assert_called_once_with("pieces_all", 3, 1, 20)
        self.assertEqual(generate.call_count, 21)
        self.assertEqual(question.kind, "squares_side")
        self.assertTrue(question.answers)

    def test_total_exhaustion_is_bounded_and_preserves_the_current_round(self):
        practice = Practice()
        before = practice.start({})
        practice.check(before["id"], before["position"])
        snapshot = (practice.round_id, practice.size, practice.mode, practice.streak, practice.question)
        with patch("game.generate_candidate", return_value={"a3": "wP"}) as generate, patch("game.record_retry_limit") as log:
            with self.assertRaisesRegex(ValueError, "Couldn't make a puzzle"):
                practice.start({"mode": "threats_fixed", "count": 1})
        self.assertEqual(generate.call_count, 6 * MAX_GENERATION_ATTEMPTS)
        self.assertEqual(log.call_count, 6)
        self.assertEqual(snapshot, (practice.round_id, practice.size, practice.mode, practice.streak, practice.question))

    def test_all_generated_threat_types_have_answers_and_victims(self):
        # This position supports every type, including both attacking colours.
        position = {"a1": "wR", "a3": "bR", "c2": "wN"}
        for key, template in CATALOGUE.items():
            if template.family != "threats":
                continue
            with patch("game.generate_candidate", return_value=position):
                generated, question, _ = generate_round("threats_fixed", 3, 3, [key])
            self.assertTrue(question.answers)
            if key.startswith("pieces_"):
                self.assertEqual({piece[0] for piece in generated.values()}, {"w", "b"})

    def test_logs_group_limits_without_positions_or_session_ids(self):
        with TemporaryDirectory() as folder:
            path = Path(folder) / "generation.jsonl"
            with patch("generation_diagnostics.LOG_PATH", path):
                generation_diagnostics.record_retry_limit("pieces_all", 3, 1, 20)
                generation_diagnostics.record_retry_limit("pieces_all", 3, 1, 20)
            events = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]
            self.assertEqual(generation_diagnostics.retry_counts(path)[("pieces_all", 3, 1)], 2)
            self.assertEqual(set(events[0]), {"timestamp", "event", "question_type", "board_size", "piece_count", "attempts"})

    def test_logging_failure_does_not_prevent_fallback(self):
        with patch("generation_diagnostics.LOG_PATH") as path, self.assertLogs("generation_diagnostics", level="WARNING"):
            path.parent.mkdir.side_effect = PermissionError("read-only")
            generation_diagnostics.record_retry_limit("pieces_all", 3, 1, 20)

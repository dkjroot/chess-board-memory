import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from questions import CATALOGUE, WORDING_PATH
from game import Practice


class WordingTests(unittest.TestCase):
    def setUp(self):
        self.folder = TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name) / "question_text.json"
        self.document = json.loads(WORDING_PATH.read_text(encoding="utf-8"))
        self.write()
        self.patcher = patch("questions.WORDING_PATH", self.path)
        self.patcher.start()
        self.addCleanup(self.patcher.stop)

    def write(self):
        self.path.write_text(json.dumps(self.document, ensure_ascii=False), encoding="utf-8")

    def test_every_type_has_a_name_description_header_and_editable_subhead(self):
        for key in CATALOGUE:
            entry = self.document[key]
            self.assertTrue(entry["name"])
            self.assertTrue(entry["description"])
            self.assertTrue(entry["header"])
            self.assertIsInstance(entry["subhead"], str)

    def test_edits_are_used_by_new_rounds_and_old_rounds_keep_their_text(self):
        practice = Practice()
        first = practice.start({})
        self.document["memory"].update(name="My name", description="My description", header="Where did I put them?", subhead="Put them back.")
        self.write()
        old = practice.reveal(first["id"])["question"]
        self.assertNotEqual(old["prompt"], "Where did I put them?")
        new = practice.start({})
        text = practice.reveal(new["id"])["question"]
        self.assertEqual((text["name"], text["description"], text["prompt"], text["note"]), ("My name", "My description", "Where did I put them?", "Put them back."))
        self.assertNotIn("question", new)

    def test_placeholders_and_tool_labels_are_editable_without_changing_answers(self):
        entry = self.document["pieces_piece"]
        entry["header"] = "{victim_colour} pieces: which ones can {attacker} take?"
        entry["subhead"] = "{piece_count} {pieces}; looking at {victim_lower} pieces."
        entry["markers"]["x"] = "My red cross"
        self.write()
        with patch("questions.random.choice", return_value="bR"):
            question = CATALOGUE["pieces_piece"].build(3, {"a1": "bR", "a3": "wP"})
        self.assertEqual(question.prompt, "White pieces: which ones can Black's rook take?")
        self.assertEqual(question.note, "1 rooks; looking at white pieces.")
        self.assertEqual(question.answers, {"a3": "x"})
        self.assertEqual(question.markers["x"], "My red cross")

    def test_invalid_json_missing_fields_and_bad_placeholders_are_clear_errors(self):
        for bad in ("{", "[]", '{"memory": {}}'):
            self.path.write_text(bad, encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "question_text.json.*memory"):
                CATALOGUE["memory"].build(3, {"a1": "wK"})
        self.document["memory"]["header"] = "{unknown}"
        self.write()
        with self.assertRaisesRegex(ValueError, "placeholder.*unknown"):
            CATALOGUE["memory"].build(3, {"a1": "wK"})

    def test_marker_ids_cannot_be_redefined_by_wording(self):
        self.document["pieces_both"]["markers"] = {"new": "Different symbol"}
        self.write()
        with self.assertRaisesRegex(ValueError, "markers must keep"):
            CATALOGUE["pieces_both"].build(3, {"a1": "wR", "a3": "bR"})

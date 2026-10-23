from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest

from run_tests import execute, failure_output


class RunnerTests(unittest.TestCase):
    def test_success_is_logged_without_printing_test_output(self):
        with TemporaryDirectory() as directory:
            log = Path(directory) / "success.log"
            result = execute("example", [sys.executable, "-c", "print('full test output')"], log, 5)
            self.assertTrue(result.passed)
            self.assertIn("full test output", log.read_text(encoding="utf-8"))

    def test_failure_preserves_full_output_and_bounds_the_excerpt(self):
        with TemporaryDirectory() as directory:
            log = Path(directory) / "failure.log"
            result = execute("example", [sys.executable, "-c", "import sys; print('first line'); print('detail\\n' * 100); print('failure reason', file=sys.stderr); sys.exit(2)"], log, 5)
            self.assertFalse(result.passed)
            self.assertIn("first line", log.read_text(encoding="utf-8"))
            excerpt = failure_output(result)
            self.assertNotIn("first line", excerpt)
            self.assertIn(str(log), excerpt)

    def test_missing_executable_is_reported_in_log(self):
        with TemporaryDirectory() as directory:
            log = Path(directory) / "missing.log"
            result = execute("example", [str(Path(directory) / "missing-executable")], log, 5)
            self.assertFalse(result.passed)
            self.assertIn("FileNotFoundError", log.read_text(encoding="utf-8"))

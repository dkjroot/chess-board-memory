"""Run every check, keeping successful test output in local log files."""

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import os
from pathlib import Path
import re
import subprocess
import sys
from threading import Thread
from time import perf_counter
from uuid import uuid4

ROOT = Path(__file__).resolve().parent


@dataclass
class Check:
    name: str
    passed: bool
    log: Path
    detail: str = ""


def execute(name: str, command: list[str], log: Path, timeout: int,
            env: dict[str, str] | None = None) -> Check:
    """Stream all output to disk, rather than buffering it in agent context."""
    with log.open("w", encoding="utf-8") as output:
        try:
            result = subprocess.run(command, cwd=ROOT, env=env, stdout=output,
                                    stderr=subprocess.STDOUT, timeout=timeout, check=False)
            return Check(name, result.returncode == 0, log)
        except (OSError, subprocess.TimeoutExpired) as exc:
            output.write(f"\n{type(exc).__name__}: {exc}\n")
            return Check(name, False, log)


def failure_output(check: Check) -> str:
    lines = check.log.read_text(encoding="utf-8", errors="replace").splitlines()
    excerpt = "\n".join(lines[-80:])
    return f"\n--- {check.name}: failure output (last 80 lines at most) ---\n{excerpt}\nFull log: {check.log}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--node", default=os.environ.get("NODE_BINARY", "node"),
                        help="Node 20+ executable (default: NODE_BINARY or node on PATH)")
    parser.add_argument("--timeout", type=int, default=120, help="Timeout per check in seconds")
    args = parser.parse_args()
    if args.timeout < 1:
        parser.error("--timeout must be positive")
    began = perf_counter()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    artifacts = ROOT / "tests" / "artifacts" / "runs" / f"{stamp}-{uuid4().hex[:6]}"
    artifacts.mkdir(parents=True)
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["CHESS_MEMORY_GENERATION_LOG"] = str(artifacts / "generation.jsonl")
    checks = []
    unit = execute("Python tests", [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"],
                   artifacts / "python.log", args.timeout, env)
    match = re.search(r"Ran (\d+) tests?", unit.log.read_text(encoding="utf-8", errors="replace"))
    unit.detail = f"{match[1]} tests" if match else "see log"
    checks.append(unit)
    checks.append(execute("Opening model tests", [args.node, "tests/openings.cjs"],
                          artifacts / "openings.log", args.timeout, env))
    sources = sorted((ROOT / "static").rglob("*.js")) + sorted((ROOT / "tests").rglob("*.cjs"))
    for index, source in enumerate(sources):
        checks.append(execute(f"JavaScript syntax: {source.relative_to(ROOT)}",
                              [args.node, "--check", str(source)], artifacts / f"syntax-{index}.log",
                              args.timeout, env))

    # An independent ephemeral-port server leaves the user's running app alone.
    server_log = artifacts / "server.log"
    browser_log = artifacts / "browser.log"
    try:
        from app import Handler, ThreadingHTTPServer
        import generation_diagnostics
        generation_diagnostics.LOG_PATH = artifacts / "generation.jsonl"

        with server_log.open("w", encoding="utf-8") as output:
            class QuietHandler(Handler):
                def log_message(self, format: str, *values: object) -> None:
                    output.write((format % values) + "\n")
                    output.flush()

            server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
            thread = Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                env["TEST_URL"] = f"http://127.0.0.1:{server.server_port}"
                env["TEST_ARTIFACT_DIR"] = str(artifacts / "screenshots")
                checks.append(execute("Browser tests", [args.node, "tests/browser.cjs"],
                                      browser_log, args.timeout, env))
                checks.append(execute("Opening browser tests", [args.node, "tests/openings-browser.cjs"],
                                      artifacts / "openings-browser.log", args.timeout, env))
            finally:
                server.shutdown()
                server.server_close()
                thread.join()
    except OSError as exc:
        browser_log.write_text(f"Could not start local test server: {exc}\n", encoding="utf-8")
        checks.append(Check("Browser tests", False, browser_log))

    passed = all(check.passed for check in checks)
    lines = [f"{'PASS' if check.passed else 'FAIL'}  {check.name}" +
             (f" ({check.detail})" if check.detail else "") for check in checks]
    lines.append(f"{'PASS - all checks passed' if passed else 'FAIL - checks need attention'} ({perf_counter() - began:.1f}s)")
    lines.append(f"Logs and screenshots: {artifacts}")
    summary = "\n".join(lines)
    (artifacts / "summary.txt").write_text(summary + "\n", encoding="utf-8")
    print(summary)
    for check in checks:
        if not check.passed:
            print(failure_output(check))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())

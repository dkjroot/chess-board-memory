"""Local retry-limit diagnostics, without board positions or browser/session IDs."""

from collections import Counter
from datetime import datetime, timezone
import json
import logging
import os
from pathlib import Path
from threading import Lock

LOG_PATH = Path(os.environ.get("CHESS_MEMORY_GENERATION_LOG", Path(__file__).parent / "logs" / "generation.jsonl"))
LOCK = Lock()


def record_retry_limit(question_type: str, size: int, count: int, attempts: int) -> None:
    event = {"timestamp": datetime.now(timezone.utc).isoformat(), "event": "generation_retry_limit",
             "question_type": question_type, "board_size": size, "piece_count": count, "attempts": attempts}
    try:
        with LOCK:
            LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
            with LOG_PATH.open("a", encoding="utf-8", newline="\n") as log:
                log.write(json.dumps(event) + "\n")
    except OSError as exc:
        # Diagnostics must not prevent a usable fallback puzzle.
        logging.getLogger(__name__).warning("Could not write puzzle diagnostics: %s", exc)


def retry_counts(path: Path = LOG_PATH) -> Counter:
    counts: Counter = Counter()
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            try:
                event = json.loads(line)
                if event.get("event") == "generation_retry_limit":
                    counts[(event["question_type"], event["board_size"], event["piece_count"])] += 1
            except (ValueError, KeyError, TypeError, AttributeError):
                continue  # Ignore incomplete records left by an interrupted write.
    return counts


if __name__ == "__main__":
    counts = retry_counts()
    if not counts:
        print("No recorded puzzle retry limits.")
    else:
        print("Retry limits reached, grouped by question type, board size and piece count:")
        for (kind, size, count), times in sorted(counts.items()):
            print(f"{kind:16}  {size} x {size}  {count:2} pieces  {times:5} times")
    print(f"Log: {LOG_PATH}")

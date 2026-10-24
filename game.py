"""Position generation, grading and progressive practice; no browser dependencies."""

from dataclasses import dataclass, field
from collections import Counter
import random
from secrets import token_urlsafe

from chess_rules import squares
from questions import CATALOGUE, Question, question_pool
from generation_diagnostics import record_retry_limit

PIECES = tuple(f"{colour}{kind}" for colour in "wb" for kind in "KQRBNP")
STOCK = {piece: {"K": 1, "Q": 1, "R": 2, "B": 2, "N": 2, "P": 8}[piece[1]] for piece in PIECES}
MATERIAL = tuple(piece for piece, count in STOCK.items() for _ in range(count))
MODES = tuple(f"{family}_{training}" for family in ("memory", "threats", "random") for training in ("fixed", "progressive"))
MAX_GENERATION_ATTEMPTS = 20


def generate_candidate(size: int, count: int) -> dict[str, str]:
    return dict(zip(random.sample(sorted(squares(size)), count), random.sample(MATERIAL, count)))


def generate_round(mode: str, size: int, count: int, bag: list[str]) -> tuple[dict[str, str], Question, list[str]]:
    """Try a bounded number of candidates per type, then another type in this bag."""
    pool = question_pool(mode.split("_")[0])
    remaining = bag.copy()
    tried: set[str] = set()
    while len(tried) < len(pool):
        if not remaining:
            remaining = [key for key in pool if key not in tried]
            random.shuffle(remaining)
        key = remaining.pop()
        if key in tried:
            continue
        tried.add(key)
        for _ in range(MAX_GENERATION_ATTEMPTS):
            position = generate_candidate(size, count)
            question = CATALOGUE[key].build(size, position)
            if question.answers:
                return position, question, remaining
        record_retry_limit(key, size, count, MAX_GENERATION_ATTEMPTS)
    raise ValueError("Couldn't make a puzzle with an answer after retrying. Try more pieces or a larger board.")


def normalize_mode(mode: str) -> str:
    return {"fixed": "memory_fixed", "progressive": "memory_progressive"}.get(mode, mode)


def integer(value: object, name: str, low: int, high: int) -> int:
    if type(value) is not int or not low <= value <= high:
        raise ValueError(f"{name} must be a whole number from {low} to {high}.")
    return value


@dataclass
class Practice:
    size: int = 3
    streak: int = 0
    rounds: int = 0
    perfects: int = 0
    mode: str = "memory_progressive"
    palette: str = "puzzle"
    round_id: str = ""
    target: dict[str, str] = field(default_factory=dict)
    inventory: dict[str, int] = field(default_factory=dict)
    bag: list[str] = field(default_factory=list)
    question: Question | None = None
    result: dict | None = None

    def start(self, settings: dict) -> dict:
        size = integer(settings.get("size", 3), "Board size", 3, 8)
        count = integer(settings.get("count", 3), "Piece count", 1, min(32, size * size))
        seconds = integer(settings.get("seconds", 8), "Viewing time", 2, 60)
        raw_mode = settings.get("mode", "memory_progressive")
        if not isinstance(raw_mode, str):
            raise ValueError("Choose a practice mode.")
        mode = normalize_mode(raw_mode)
        palette = settings.get("palette", "puzzle")
        if mode not in MODES:
            raise ValueError("Choose memory, threats or random questions, fixed or progressive.")
        if palette not in ("puzzle", "all"):
            raise ValueError("Choose puzzle pieces or all pieces for the palette.")
        position, question, bag = generate_round(mode, size, count, self.bag if mode == self.mode else [])
        if size != self.size or mode != self.mode:
            self.streak = 0
        self.size, self.mode = size, mode
        self.palette = palette
        self.target = position
        self.inventory = STOCK.copy() if palette == "all" else dict(Counter(self.target.values()))
        self.round_id, self.result = token_urlsafe(18), None
        self.question, self.bag = question, bag
        return {"id": self.round_id, "size": size, "seconds": seconds,
                "position": self.target, "count": count, "palette": palette,
                "pieces": [piece for piece in PIECES if piece in self.inventory],
                "inventory": self.inventory,
                "progress": self.progress()}

    def reveal(self, round_id: str) -> dict:
        if not self.round_id or round_id != self.round_id or self.question is None:
            raise ValueError("This round has expired. Start a new round.")
        return {"question": self.question.public()}

    def progress(self) -> dict:
        return {"size": self.size, "streak": self.streak, "rounds": self.rounds,
                "perfects": self.perfects, "mode": self.mode}

    def check(self, round_id: str, placement: object) -> dict:
        if not self.round_id or round_id != self.round_id:
            raise ValueError("This round has expired. Start a new round.")
        if self.result is not None:
            return self.result
        if not isinstance(placement, dict):
            raise ValueError("The answer must be a board position.")
        allowed = squares(self.size)
        assert self.question is not None
        available = dict.fromkeys(self.question.markers, len(allowed)) if self.question.answer_kind == "marks" else self.inventory
        if any(sq not in allowed or not isinstance(piece, str) or piece not in available for sq, piece in placement.items()):
            raise ValueError("The answer contains an invalid square or piece.")
        if any(count > available[piece] for piece, count in Counter(placement.values()).items()):
            raise ValueError("The answer uses more pieces of a type than are available.")
        answers = self.question.answers
        correct = [sq for sq, piece in answers.items() if placement.get(sq) == piece]
        perfect = placement == answers
        self.rounds += 1
        self.perfects += int(perfect)
        self.streak = self.streak + 1 if perfect else 0
        advanced = self.mode.endswith("_progressive") and self.streak >= 3 and self.size < 8
        if advanced:
            self.size += 1
            self.streak = 0
        self.result = {"correct": correct, "total": len(answers), "perfect": perfect,
                       "extra": [sq for sq in placement if sq not in answers],
                       "target": answers, "position": self.target,
                       "advanced": advanced, "progress": self.progress()}
        return self.result

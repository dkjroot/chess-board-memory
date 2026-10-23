"""Position generation, grading and progressive practice; no browser dependencies."""

from dataclasses import dataclass, field
from collections import Counter
import random
from secrets import token_urlsafe

PIECES = tuple(f"{colour}{kind}" for colour in "wb" for kind in "KQRBNP")
STOCK = {piece: {"K": 1, "Q": 1, "R": 2, "B": 2, "N": 2, "P": 8}[piece[1]] for piece in PIECES}
MATERIAL = tuple(piece for piece, count in STOCK.items() for _ in range(count))


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
    mode: str = "progressive"
    palette: str = "puzzle"
    round_id: str = ""
    target: dict[str, str] = field(default_factory=dict)
    inventory: dict[str, int] = field(default_factory=dict)
    result: dict | None = None

    def start(self, settings: dict) -> dict:
        size = integer(settings.get("size", 3), "Board size", 3, 8)
        count = integer(settings.get("count", 3), "Piece count", 1, min(32, size * size))
        seconds = integer(settings.get("seconds", 8), "Viewing time", 2, 60)
        mode = settings.get("mode", "progressive")
        palette = settings.get("palette", "puzzle")
        if mode not in ("progressive", "fixed"):
            raise ValueError("Choose progressive or fixed practice.")
        if palette not in ("puzzle", "all"):
            raise ValueError("Choose puzzle pieces or all pieces for the palette.")
        if size != self.size or mode != self.mode:
            self.streak = 0
        self.size, self.mode = size, mode
        self.palette = palette
        squares = [f"{chr(97 + col)}{row}" for row in range(1, size + 1) for col in range(size)]
        self.target = dict(zip(random.sample(squares, count), random.sample(MATERIAL, count)))
        self.inventory = STOCK.copy() if palette == "all" else dict(Counter(self.target.values()))
        self.round_id, self.result = token_urlsafe(18), None
        return {"id": self.round_id, "size": size, "seconds": seconds,
                "position": self.target, "count": count, "palette": palette,
                "pieces": [piece for piece in PIECES if piece in self.inventory],
                "inventory": self.inventory,
                "progress": self.progress()}

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
        allowed = {f"{chr(97 + c)}{r}" for r in range(1, self.size + 1) for c in range(self.size)}
        if any(sq not in allowed or not isinstance(piece, str) or piece not in self.inventory for sq, piece in placement.items()):
            raise ValueError("The answer contains an invalid square or piece.")
        if any(count > self.inventory[piece] for piece, count in Counter(placement.values()).items()):
            raise ValueError("The answer uses more pieces of a type than are available.")
        correct = [sq for sq, piece in self.target.items() if placement.get(sq) == piece]
        perfect = placement == self.target
        self.rounds += 1
        self.perfects += int(perfect)
        self.streak = self.streak + 1 if perfect else 0
        advanced = self.mode == "progressive" and self.streak >= 3 and self.size < 8
        if advanced:
            self.size += 1
            self.streak = 0
        self.result = {"correct": correct, "total": len(self.target), "perfect": perfect,
                       "extra": [sq for sq in placement if sq not in self.target],
                       "target": self.target, "advanced": advanced, "progress": self.progress()}
        return self.result

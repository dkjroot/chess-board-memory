"""Question catalogue: training policy chooses a bag; builders own the question."""

from dataclasses import dataclass, field
from functools import partial
import random
import json
from pathlib import Path
from string import Formatter
from typing import Callable

from chess_rules import threatened_squares, threatened_pieces

NAMES = {"K": "king", "Q": "queen", "R": "rook", "B": "bishop", "N": "knight", "P": "pawn"}
WORDING_PATH = Path(__file__).with_name("question_text.json")


@dataclass
class Question:
    kind: str
    prompt: str
    answer_kind: str
    answers: dict[str, str]
    note: str = ""
    markers: dict[str, str] = field(default_factory=lambda: {"x": "Red X"})
    name: str = ""
    description: str = ""
    context: dict[str, str | int] = field(default_factory=dict)

    def public(self) -> dict:
        return {"kind": self.kind, "prompt": self.prompt, "answer_kind": self.answer_kind,
                "note": self.note, "markers": self.markers, "name": self.name,
                "description": self.description, "context": self.context}


def wording(key: str, context: dict, marker_ids: set[str]) -> dict:
    """Read per build so edits apply to the next round; existing rounds keep their text."""
    try:
        document = json.loads(WORDING_PATH.read_text(encoding="utf-8"))
        entry = document[key]
        result = {}
        for field_name in ("name", "description", "header", "subhead"):
            text = entry[field_name]
            if not isinstance(text, str) or (field_name != "subhead" and not text.strip()):
                raise ValueError(f"{field_name} must be {'a' if field_name == 'subhead' else 'a non-empty'} string")
            for _, placeholder, spec, conversion in Formatter().parse(text):
                if placeholder is not None and (placeholder not in context or spec or conversion):
                    raise ValueError(f"Unknown or unsupported placeholder {{{placeholder}}} in {field_name}")
            result[field_name] = text.format_map(context)
        markers = entry["markers"]
        if not isinstance(markers, dict) or set(markers) != marker_ids or any(not isinstance(label, str) or not label.strip() for label in markers.values()):
            raise ValueError(f"markers must keep these IDs: {', '.join(sorted(marker_ids)) or '(none)'}")
        result["markers"] = markers
        return result
    except (OSError, ValueError, KeyError, TypeError) as exc:
        raise ValueError(f"{WORDING_PATH.name}, question '{key}': {exc}") from exc


def make_question(key: str, answer_kind: str, answers: dict[str, str],
                  context: dict | None = None) -> Question:
    context = context or {}
    marker_ids = set() if answer_kind == "position" else {"xw", "xb"} if key == "pieces_both" else {"x"}
    text = wording(key, context, marker_ids)
    return Question(key, text["header"], answer_kind, answers, text["subhead"],
                    text["markers"], text["name"], text["description"], context)


def memory(size: int, position: dict[str, str]) -> Question:
    return make_question("memory", "position", position.copy())


def threats(size: int, position: dict[str, str], *, piece_filter: bool, pieces_only: bool) -> Question:
    if piece_filter:
        # Ask about every piece of this colour/type, rather than inventing identities.
        group = random.choice(sorted(set(position.values())))
        colour, kind = group
        count = sum(piece == group for piece in position.values())
        attacker = f"{'White' if colour == 'w' else 'Black'}'s {NAMES[kind]}{'s' if count > 1 else ''}"
    else:
        colour = random.choice(sorted({piece[0] for piece in position.values()}))
        kind = None
        attacker = f"{'White' if colour == 'w' else 'Black'} pieces"
    key = f"{'pieces' if pieces_only else 'squares'}_{'piece' if piece_filter else 'side'}"
    answers = threatened_pieces(position, size, colour, kind) if pieces_only else threatened_squares(position, size, colour, kind)
    victim = "Black" if colour == "w" else "White"
    context = {"attacker": attacker, "attacker_colour": "White" if colour == "w" else "Black",
               "victim_colour": victim, "victim_lower": victim.lower()}
    if piece_filter:
        context.update(piece=NAMES[kind], pieces=NAMES[kind] + "s", piece_count=count)
    return make_question(key, "marks", dict.fromkeys(sorted(answers), "x"), context)


def all_threatened_pieces(size: int, position: dict[str, str], *, split: bool) -> Question:
    by_white = threatened_pieces(position, size, "w")
    by_black = threatened_pieces(position, size, "b")
    if split:
        answers = {**dict.fromkeys(sorted(by_white), "xw"), **dict.fromkeys(sorted(by_black), "xb")}
        return make_question("pieces_both", "marks", answers)
    return make_question("pieces_all", "marks", dict.fromkeys(sorted(by_white | by_black), "x"))


@dataclass(frozen=True)
class Template:
    family: str
    build: Callable[[int, dict[str, str]], Question]


CATALOGUE = {
    "memory": Template("memory", memory),
    "squares_side": Template("threats", partial(threats, piece_filter=False, pieces_only=False)),
    "squares_piece": Template("threats", partial(threats, piece_filter=True, pieces_only=False)),
    "pieces_side": Template("threats", partial(threats, piece_filter=False, pieces_only=True)),
    "pieces_piece": Template("threats", partial(threats, piece_filter=True, pieces_only=True)),
    "pieces_all": Template("threats", partial(all_threatened_pieces, split=False)),
    "pieces_both": Template("threats", partial(all_threatened_pieces, split=True)),
}


def question_pool(family: str) -> list[str]:
    return [key for key, template in CATALOGUE.items() if family == "random" or template.family == family]

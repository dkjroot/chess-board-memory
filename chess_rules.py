"""Attack maps on 3–8 square boards; independent of puzzle generation and UI.

These are attacks, not legal moves: pinned pieces still attack, kings attack all
adjacent squares, and the first friendly blocker is defended. White pawns attack
towards increasing ranks; Black towards decreasing ranks. There is no move history.
"""

DIAGONALS = ((1, 1), (1, -1), (-1, 1), (-1, -1))
ORTHOGONALS = ((1, 0), (-1, 0), (0, 1), (0, -1))
KNIGHT_STEPS = ((1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1))


def squares(size: int) -> set[str]:
    return {f"{chr(97 + col)}{row}" for row in range(1, size + 1) for col in range(size)}


def attacks_from(position: dict[str, str], source: str, size: int) -> set[str]:
    """Include the first occupied square on a ray, then stop at that blocker."""
    piece = position[source]
    col, row = ord(source[0]) - 97, int(source[1:]) - 1
    kind = piece[1]
    if kind == "P":
        directions = ((-1, 1 if piece[0] == "w" else -1), (1, 1 if piece[0] == "w" else -1))
    elif kind == "N":
        directions = KNIGHT_STEPS
    elif kind == "K":
        directions = DIAGONALS + ORTHOGONALS
    elif kind == "B":
        directions = DIAGONALS
    elif kind == "R":
        directions = ORTHOGONALS
    elif kind == "Q":
        directions = DIAGONALS + ORTHOGONALS
    else:
        raise ValueError("Unknown chess piece.")
    sliding = kind in "BRQ"
    result = set()
    for dx, dy in directions:
        x, y = col + dx, row + dy
        while 0 <= x < size and 0 <= y < size:
            square = f"{chr(97 + x)}{y + 1}"
            result.add(square)
            if not sliding or square in position:
                break
            x, y = x + dx, y + dy
    return result


def attacked_squares(position: dict[str, str], size: int, colour: str,
                     kind: str | None = None) -> set[str]:
    result: set[str] = set()
    for source, piece in position.items():
        if piece[0] == colour and (kind is None or piece[1] == kind):
            result.update(attacks_from(position, source, size))
    return result


def threatened_pieces(position: dict[str, str], size: int, colour: str,
                      kind: str | None = None) -> set[str]:
    return {sq for sq in attacked_squares(position, size, colour, kind)
            if sq in position and position[sq][0] != colour}


def threatened_squares(position: dict[str, str], size: int, colour: str,
                       kind: str | None = None) -> set[str]:
    """Puzzle threats exclude friendly-occupied (defended) squares, but block there."""
    return {sq for sq in attacked_squares(position, size, colour, kind)
            if sq not in position or position[sq][0] != colour}

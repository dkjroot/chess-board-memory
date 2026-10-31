"use strict";

// Each repertoire entry is a complete line. More lines can share a prefix;
// candidates are narrowed after every move, so only studied continuations count.
const LONDON_LINES = [{
  id: "london-d5", name: "London System · …d5 and …Nf6",
  moves: [
    ["d2", "d4", "d4"], ["d7", "d5", "d5"],
    ["c1", "f4", "Bf4"], ["g8", "f6", "Nf6"],
    ["e2", "e3", "e3"], ["e7", "e6", "e6"],
    ["g1", "f3", "Nf3"], ["c7", "c5", "c5"],
    ["c2", "c3", "c3"], ["b8", "c6", "Nc6"],
    ["f1", "d3", "Bd3"], ["f8", "d6", "Bd6"],
    ["b1", "d2", "Nbd2"], ["e8", "g8", "O-O"],
    ["e1", "g1", "O-O"], ["b7", "b6", "b6"]
  ]
}];

const QUEENS_GAMBIT_LINES = [
  {id: "qg-accepted", name: "Accepted", moves: [
    ["d2", "d4", "d4"], ["d7", "d5", "d5"],
    ["c2", "c4", "c4"], ["d5", "c4", "dxc4"],
    ["g1", "f3", "Nf3"], ["g8", "f6", "Nf6"],
    ["e2", "e3", "e3"], ["e7", "e6", "e6"],
    ["f1", "c4", "Bxc4"], ["c7", "c5", "c5"]
  ]},
  {id: "qg-declined", name: "Declined", moves: [
    ["d2", "d4", "d4"], ["d7", "d5", "d5"],
    ["c2", "c4", "c4"], ["e7", "e6", "e6"],
    ["b1", "c3", "Nc3"], ["g8", "f6", "Nf6"],
    ["c1", "g5", "Bg5"], ["f8", "e7", "Be7"],
    ["e2", "e3", "e3"], ["e8", "g8", "O-O"]
  ]}
];
const OPENINGS = [
  {id: "london", name: "London System", description: "Build the London setup against …d5 and …Nf6.", lines: LONDON_LINES},
  {id: "queens-gambit", name: "Queen's Gambit", description: "Watch Black's second move: our Accepted line continues with Nf3 after …dxc4; our Declined line continues with Nc3 after …e6.", lines: QUEENS_GAMBIT_LINES}
];

function startingPosition() {
  const board = {};
  for (const [i, file] of [..."abcdefgh"].entries()) {
    board[`${file}1`] = `w${"RNBQKBNR"[i]}`;
    board[`${file}2`] = "wP";
    board[`${file}7`] = "bP";
    board[`${file}8`] = `b${"RNBQKBNR"[i]}`;
  }
  return board;
}

class OpeningPractice {
  constructor(depth = 3, lines = LONDON_LINES) {
    this.lines = lines;
    this.mistakes = new Map();
    this.restarts = 0;
    this.completed = 0;
    this.coverage = new Set();
    this.lineIndex = 0;
    this.setDepth(depth);
  }
  get maxDepth() { return Math.max(...this.lines.map((line) => Math.floor(line.moves.length / 2))); }
  setDepth(depth) {
    if (!Number.isInteger(depth) || depth < 1) throw new Error("Invalid practice depth.");
    if (this.depth !== depth) { this.coverage.clear(); this.lineIndex = 0; this.ply = 0; }
    this.depth = depth;
    this.restart();
  }
  restart() {
    if (this.complete && !this.pinnedLineId) this.lineIndex = (this.lineIndex + 1) % this.lines.length;
    this.board = startingPosition();
    this.ply = 0;
    this.candidates = this.lines.filter(line => !this.pinnedLineId || line.id === this.pinnedLineId);
    this.history = [];
  }
  get targetLine() {
    const target = this.lines.find(line => line.id === this.pinnedLineId) || this.lines[this.lineIndex];
    return this.candidates.includes(target) ? target : this.candidates[0];
  }
  pinLine(id = null) {
    const matching = this.lines.filter(line => this.history.every((san, i) => line.moves[i]?.[2] === san));
    if (id && !matching.some(line => line.id === id)) throw new Error("This variation doesn't match the current run.");
    this.pinnedLineId = id;
    if (id) this.lineIndex = this.lines.findIndex(line => line.id === id);
    this.candidates = matching.filter(line => !id || line.id === id);
  }
  get requiredPrefixes() {
    return new Set(this.lines.filter(line => !this.pinnedLineId || line.id === this.pinnedLineId)
      .map(line => line.moves.slice(0, this.depth * 2).map(move => move[2]).join(" ")));
  }
  get lineCount() { return this.requiredPrefixes.size; }
  get depthComplete() { return [...this.requiredPrefixes].every(prefix => this.coverage.has(prefix)); }
  get targetDepth() { return Math.min(this.depth, Math.floor(this.targetLine.moves.length / 2)); }
  get complete() { return Boolean(this.candidates?.length) && this.ply >= this.targetDepth * 2; }
  get whiteToMove() { return !this.complete && this.ply % 2 === 0; }
  // Use the full position rather than a ply number, to keep future branches distinct.
  get positionKey() { return JSON.stringify(Object.entries(this.board).sort()); }
  get hintLevel() { return Math.min(2, this.mistakes.get(this.positionKey) || 0); }
  get suggestions() {
    return this.candidates.map((line) => line.moves[this.ply]).filter((move, i, all) =>
      move && all.findIndex((other) => other[0] === move[0] && other[1] === move[1]) === i);
  }
  apply(move) {
    const [from, to, san] = move;
    const piece = this.board[from];
    delete this.board[from];
    this.board[to] = piece;
    if (piece[1] === "K" && from[0] === "e" && to[0] === "g") {
      this.board[`f${from[1]}`] = this.board[`h${from[1]}`];
      delete this.board[`h${from[1]}`];
    }
    this.history.push(san);
    this.ply++;
    if (this.complete) { this.completed++; this.coverage.add(this.history.join(" ")); }
  }
  play(from, to) {
    if (!this.whiteToMove) return {ignored: true};
    const matching = this.candidates.filter((line) => {
      const move = line.moves[this.ply];
      return move && move[0] === from && move[1] === to;
    });
    if (!matching.length) {
      const failedMove = this.ply / 2 + 1;
      const key = this.positionKey;
      this.mistakes.set(key, (this.mistakes.get(key) || 0) + 1);
      this.restarts++;
      this.restart();
      return {correct: false, failedMove};
    }
    this.mistakes.delete(this.positionKey);
    this.candidates = matching;
    this.apply(matching[0].moves[this.ply]);
    return {correct: true};
  }
  reply() {
    if (this.complete || this.whiteToMove) return false;
    const move = this.targetLine.moves[this.ply];
    this.candidates = this.candidates.filter((line) => {
      const other = line.moves[this.ply];
      return other && other[0] === move[0] && other[1] === move[1];
    });
    this.apply(move);
    return true;
  }
}

if (typeof module !== "undefined") module.exports = {OpeningPractice, LONDON_LINES, QUEENS_GAMBIT_LINES, OPENINGS, startingPosition};

"use strict";

// Each repertoire entry is a complete line. More lines can share a prefix;
// candidates are narrowed after every move, so only studied continuations count.
const LONDON_LINES = [{
  id: "london-d5", name: "London System · …d5 and …Nf6",
  moves: [
    ["d2", "d4", "d4", "Take space in the centre and open a diagonal for the c1 bishop."], ["d7", "d5", "d5", "Claim central space and stop White from building a pawn centre without a challenge."],
    ["c1", "f4", "Bf4", "Develop the bishop outside the pawn chain before e3 closes its diagonal from c1."], ["g8", "f6", "Nf6"],
    ["e2", "e3", "e3", "Support the d4 pawn and open a diagonal for the f1 bishop."], ["e7", "e6", "e6", "Control d5 and open the f8 bishop’s diagonal. The c8 bishop stays behind the pawn chain for now."],
    ["g1", "f3", "Nf3"], ["c7", "c5", "c5", "Challenge the d4 pawn directly instead of letting White keep an unopposed centre."],
    ["c2", "c3", "c3", "Reinforce d4 with a pawn. Together with e3, this builds the London pawn triangle."], ["b8", "c6", "Nc6"],
    ["f1", "d3", "Bd3"], ["f8", "d6", "Bd6"],
    ["b1", "d2", "Nbd2"], ["e8", "g8", "O-O", "Move the king away from the centre and bring the rook towards the middle of the board."],
    ["e1", "g1", "O-O", "Move the king away from the centre and bring the rook towards the middle of the board."], ["b7", "b6", "b6"]
  ]
}];

const QUEENS_GAMBIT_LINES = [
  {id: "qg-accepted", name: "Accepted", moves: [
    ["d2", "d4", "d4", "Take space in the centre and open a diagonal for the c1 bishop."], ["d7", "d5", "d5", "Claim central space and stop White from building a pawn centre without a challenge."],
    ["c2", "c4", "c4", "Offer a wing pawn to challenge Black’s central d5 pawn and put pressure on the centre."], ["d5", "c4", "dxc4", "Accept the gambit and give up the d5 foothold for freer piece play. Keeping the extra pawn is not the main aim."],
    ["g1", "f3", "Nf3"], ["g8", "f6", "Nf6"],
    ["e2", "e3", "e3", "Support the d4 pawn and open a diagonal for the f1 bishop."], ["e7", "e6", "e6", "Control d5 and open the f8 bishop’s diagonal. The c8 bishop stays behind the pawn chain for now."],
    ["f1", "c4", "Bxc4", "Recover the offered pawn while developing the bishop. One move does two useful jobs."], ["c7", "c5", "c5", "Challenge the d4 pawn directly instead of letting White keep an unopposed centre."]
  ]},
  {id: "qg-declined", name: "Declined", moves: [
    ["d2", "d4", "d4", "Take space in the centre and open a diagonal for the c1 bishop."], ["d7", "d5", "d5", "Claim central space and stop White from building a pawn centre without a challenge."],
    ["c2", "c4", "c4", "Offer a wing pawn to challenge Black’s central d5 pawn and put pressure on the centre."], ["e7", "e6", "e6", "Control d5 and open the f8 bishop’s diagonal. The c8 bishop stays behind the pawn chain for now."],
    ["b1", "c3", "Nc3"], ["g8", "f6", "Nf6"],
    ["c1", "g5", "Bg5", "Develop the bishop and pin the f6 knight along the diagonal towards Black’s queen."], ["f8", "e7", "Be7", "Develop the bishop and clear the way for kingside castling."],
    ["e2", "e3", "e3", "Support the d4 pawn and open a diagonal for the f1 bishop."], ["e8", "g8", "O-O", "Move the king away from the centre and bring the rook towards the middle of the board."]
  ]}
];
// Black chooses a Declined repertoire, then learns different White continuations.
// It deliberately doesn't mirror White's Accepted/Declined choices.
const QUEENS_GAMBIT_BLACK_LINES = [
  {id: "qgd-black-bg5", name: "Against Bg5", moves: QUEENS_GAMBIT_LINES[1].moves},
  {id: "qgd-black-exchange", name: "Against the Exchange", moves: [
    ["d2", "d4", "d4", "Take space in the centre and open a diagonal for the c1 bishop."], ["d7", "d5", "d5", "Claim central space and stop White from building a pawn centre without a challenge."],
    ["c2", "c4", "c4", "Offer a wing pawn to challenge Black’s central d5 pawn and put pressure on the centre."], ["e7", "e6", "e6", "Control d5 and open the f8 bishop’s diagonal. The c8 bishop stays behind the pawn chain for now."],
    ["b1", "c3", "Nc3"], ["g8", "f6", "Nf6"],
    ["c4", "d5", "cxd5", "Exchange the c-pawn for Black’s central d-pawn, fixing the central pawn structure."], ["e6", "d5", "exd5", "Recapture with the e-pawn to restore material balance and keep a pawn in the centre."],
    ["c1", "g5", "Bg5", "Develop the bishop and pin the f6 knight along the diagonal towards Black’s queen."], ["f8", "e7", "Be7", "Develop the bishop and clear the way for kingside castling."]
  ]}
];
const OPENINGS = [
  {id: "london", name: "London System", side: "white", lines: LONDON_LINES},
  {id: "queens-gambit", name: "Queen's Gambit", side: "white", lines: QUEENS_GAMBIT_LINES},
  {id: "london-black", name: "Against the London", side: "black", lines: [{id: "london-black-d5", name: "…d5 and …Nf6", moves: LONDON_LINES[0].moves}]},
  {id: "queens-gambit-black", name: "Queen's Gambit Declined", side: "black", lines: QUEENS_GAMBIT_BLACK_LINES}
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
  constructor(depth = 3, lines = LONDON_LINES, side = "white") {
    this.lines = lines;
    this.side = side;
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
    this.ideas = {white: null, black: null};
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
  get userToMove() { return !this.complete && this.ply % 2 === (this.side === "black" ? 1 : 0); }
  // Use the full position rather than a ply number, to keep future branches distinct.
  get positionKey() { return JSON.stringify(Object.entries(this.board).sort()); }
  get hintLevel() { return Math.min(2, this.mistakes.get(this.positionKey) || 0); }
  get suggestions() {
    return this.candidates.map((line) => line.moves[this.ply]).filter((move, i, all) =>
      move && all.findIndex((other) => other[0] === move[0] && other[1] === move[1]) === i);
  }
  apply(move) {
    const [from, to, san, idea] = move;
    const moveNumber = Math.floor(this.ply / 2) + 1;
    const piece = this.board[from];
    delete this.board[from];
    this.board[to] = piece;
    if (piece[1] === "K" && from[0] === "e" && to[0] === "g") {
      this.board[`f${from[1]}`] = this.board[`h${from[1]}`];
      delete this.board[`h${from[1]}`];
    }
    this.history.push(san);
    if (idea) {
      const side = piece[0] === "w" ? "white" : "black";
      this.ideas[side] = {text: idea, notation: `${moveNumber}${side === "white" ? "." : "..."} ${san}`};
    }
    this.ply++;
    if (this.complete) { this.completed++; this.coverage.add(this.history.join(" ")); }
  }
  play(from, to) {
    if (!this.userToMove) return {ignored: true};
    const matching = this.candidates.filter((line) => {
      const move = line.moves[this.ply];
      return move && move[0] === from && move[1] === to;
    });
    if (!matching.length) {
      const failedMove = Math.floor(this.ply / 2) + 1;
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
    if (this.complete || this.userToMove) return false;
    const move = this.targetLine.moves[this.ply];
    this.candidates = this.candidates.filter((line) => {
      const other = line.moves[this.ply];
      return other && other[0] === move[0] && other[1] === move[1];
    });
    this.apply(move);
    return true;
  }
}

if (typeof module !== "undefined") module.exports = {OpeningPractice, LONDON_LINES, QUEENS_GAMBIT_LINES, QUEENS_GAMBIT_BLACK_LINES, OPENINGS, startingPosition};

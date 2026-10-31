const assert = require('node:assert/strict');
const {OpeningPractice, LONDON_LINES} = require('../static/opening-practice.js');
const line = LONDON_LINES[0].moves;
const practice = new OpeningPractice(8);
// Mistakes at later positions persist through a restart, without leaking to move 1.
assert.equal(practice.play('d2', 'd4').correct, true);
assert.equal(practice.play('e2', 'e4').ignored, true);
practice.reply();
assert.equal(practice.play('g1', 'f3').correct, false);
assert.equal(practice.ply, 0);
assert.equal(practice.hintLevel, 0);
for (const expected of [1, 2]) {
  practice.play('d2', 'd4'); practice.reply();
  assert.equal(practice.hintLevel, expected);
  if (expected === 1) practice.play('e2', 'e3');
}
// Success clears only this position; a fresh mistake starts at the first hint.
practice.play('c1', 'f4'); practice.reply();
practice.play('a2', 'a3');
practice.play('d2', 'd4'); practice.reply();
assert.equal(practice.hintLevel, 0);
practice.play('g1', 'f3');
practice.play('d2', 'd4'); practice.reply();
assert.equal(practice.hintLevel, 1);
practice.play('c1', 'f4'); practice.reply();
assert.equal(practice.hintLevel, 1, 'Hints at other positions remain until answered correctly');
practice.setDepth(1);
practice.play('d2', 'd4'); practice.reply();
assert.equal(practice.complete, true);
assert.equal(practice.reply(), false);
assert.equal(practice.completed, 1);
practice.setDepth(8);
for (let ply = 0; ply < line.length; ply += 2) {
  assert.equal(practice.play(...line[ply]).correct, true);
  practice.reply();
}
assert.equal(practice.complete, true);
assert.equal(practice.board.g1, 'wK');
assert.equal(practice.board.f1, 'wR');
assert.equal(practice.board.g8, 'bK');
assert.equal(practice.board.f8, 'bR');
assert.equal(practice.board.e1, undefined);
assert.equal(practice.board.h8, undefined);
assert.equal(Object.keys(practice.board).length, 32);
assert.equal(practice.completed, 2);
assert.throws(() => practice.setDepth(0));
// Alternate studied moves are accepted, but branches cannot be mixed later.
const branch = {id: 'other', moves: line.map((move) => [...move])};
branch.moves[2] = ['g1', 'f3', 'Nf3'];
branch.moves[6] = ['c1', 'f4', 'Bf4'];
const branching = new OpeningPractice(4, [LONDON_LINES[0], branch]);
branching.play('d2', 'd4'); branching.reply();
assert.equal(branching.play('g1', 'f3').correct, true);
branching.reply(); branching.play('e2', 'e3'); branching.reply();
assert.equal(branching.play('c1', 'f4').correct, true);
console.log('Opening model checks passed: reset, position-specific escalating hints, depth, turn guards, castling and alternate lines.');

// Real Black branches demand different third moves and preserve the failed branch.
const {QUEENS_GAMBIT_LINES} = require('../static/opening-practice.js');
const gambit = new OpeningPractice(5, QUEENS_GAMBIT_LINES);
const prefix = () => {gambit.play('d2','d4'); gambit.reply(); gambit.play('c2','c4'); gambit.reply();};
prefix();
assert.equal(gambit.board.c4, 'bP');
assert.equal(gambit.play('b1','c3').correct, false);
prefix();
assert.equal(gambit.board.c4, 'bP', 'A mistake retries the same Black response');
assert.equal(gambit.hintLevel, 1);
for (let i=4; i<10; i+=2) {gambit.play(...QUEENS_GAMBIT_LINES[0].moves[i]); gambit.reply();}
assert.equal(gambit.board.c4, 'wB', 'The accepted pawn is recaptured');
assert.equal(gambit.depthComplete, false);
gambit.restart(); prefix();
assert.equal(gambit.board.e6, 'bP');
assert.equal(gambit.hintLevel, 0, 'The other Black response is a different position');
assert.equal(gambit.play('g1','f3').correct, false);
prefix();
for (let i=4; i<10; i+=2) {gambit.play(...QUEENS_GAMBIT_LINES[1].moves[i]); gambit.reply();}
assert.equal(gambit.board.g8, 'bK');
assert.equal(gambit.depthComplete, true);
assert.equal(gambit.coverage.size, 2);
const shallow = new OpeningPractice(1, QUEENS_GAMBIT_LINES);
shallow.play('d2','d4'); shallow.reply();
assert.equal(shallow.lineCount, 1, 'Shared prefixes count once at shallow depths');
assert.equal(shallow.depthComplete, true);
console.log('Queen’s Gambit checks passed: both Black branches, retries, capture, branch-specific hints and breadth-first coverage.');

// Repeat 1 pins the current exact line across successes; unpinning restores cycling.
const pinned = new OpeningPractice(3, QUEENS_GAMBIT_LINES);
pinned.lineIndex = 1;
pinned.play('d2','d4'); pinned.reply();
pinned.pinLine(pinned.targetLine.id);
pinned.play('c2','c4'); pinned.reply();
assert.equal(pinned.board.e6, 'bP');
assert.throws(() => pinned.pinLine('qg-accepted'));
pinned.play('b1','c3'); pinned.reply();
assert.equal(pinned.depthComplete, true);
pinned.restart();
assert.equal(pinned.targetLine.id, 'qg-declined');
pinned.pinLine();
assert.equal(pinned.lineCount, 2);
assert.equal(pinned.depthComplete, false, 'Coverage for a pinned line does not complete both variations');
for (let i=0; i<6; i+=2) { pinned.play(...QUEENS_GAMBIT_LINES[1].moves[i]); pinned.reply(); }
pinned.restart();
assert.equal(pinned.targetLine.id, 'qg-accepted');
console.log('Repeat 1 checks passed: mid-run pinning, exact-line repetition, coverage and unpinning.');

// A shared upper limit finishes shorter lines naturally, including uneven siblings.
const upToEight = new OpeningPractice(8, QUEENS_GAMBIT_LINES);
assert.equal(upToEight.depth, 8);
assert.equal(upToEight.targetDepth, 5);
for (const variant of QUEENS_GAMBIT_LINES) {
  for (let i=0;i<variant.moves.length;i+=2) {upToEight.play(...variant.moves[i]);upToEight.reply();}
  assert.equal(upToEight.complete,true);
  assert.equal(upToEight.ply,10);
  assert.equal(upToEight.reply(),false);
  assert.equal(upToEight.play('a2','a3').ignored,true);
  if (variant === QUEENS_GAMBIT_LINES[0]) upToEight.restart();
}
assert.equal(upToEight.depthComplete,true);
const shortLondon = {id:'short-london',moves:line.slice(0,6)};
const uneven = new OpeningPractice(8,[shortLondon,LONDON_LINES[0]]);
assert.equal(uneven.maxDepth,8);
for (let i=0;i<6;i+=2) {uneven.play(...line[i]);uneven.reply();}
assert.equal(uneven.complete,true);
assert.equal(uneven.targetDepth,3);
assert.equal(uneven.depthComplete,false);
uneven.restart();
for (let i=0;i<16;i+=2) {uneven.play(...line[i]);uneven.reply();}
uneven.pinLine(); // Ended shorter candidates cannot cause an out-of-range lookup.
assert.equal(uneven.complete,true);
assert.equal(uneven.targetDepth,8);
assert.equal(uneven.depthComplete,true);
console.log('Up-to-depth checks passed: shorter lines, unequal lengths, natural completion and coverage.');

// Black owns its repertoire and responds to White's branches.
const {QUEENS_GAMBIT_BLACK_LINES, OPENINGS} = require('../static/opening-practice.js');
const black = new OpeningPractice(8,QUEENS_GAMBIT_BLACK_LINES,'black');
assert.equal(black.userToMove,false);
assert.equal(black.play('d7','d5').ignored,true);
black.reply();
assert.equal(black.userToMove,true);
assert.equal(black.play('e7','e5').correct,false);
assert.equal(black.ply,0);
black.reply();
assert.equal(black.hintLevel,1);
for (let branch=0;branch<2;branch++) {
  const moves=QUEENS_GAMBIT_BLACK_LINES[branch].moves;
  for(let ply=0;ply<moves.length;ply+=2){
    if(ply>0 || branch>0) black.reply();
    assert.equal(black.userToMove,true);
    assert.equal(black.play(...moves[ply+1]).correct,true);
  }
  assert.equal(black.complete,true);
  assert.equal(black.targetDepth,5);
  assert.equal(black.reply(),false);
  if(branch===0){assert.equal(black.board.g8,'bK');black.restart();}
}
assert.equal(black.depthComplete,true);
assert.equal(black.board.d5,'bP','Exchange variation recaptures White’s pawn');
assert.equal(OPENINGS.find(o=>o.id==='queens-gambit-black').side,'black');
assert.ok(!QUEENS_GAMBIT_BLACK_LINES.some(line=>line.name==='Accepted'));
console.log('Black repertoire checks passed: turn ownership, automatic White moves, mistakes, independent branches, captures, castling and depth cap.');

const ideas = new OpeningPractice(3);
assert.deepEqual(ideas.ideas,{white:null,black:null});
ideas.play('d2','d4');
assert.equal(ideas.ideas.white.notation,'1. d4');
assert.equal(ideas.ideas.black,null,'Opponent ideas wait for the opponent move');
ideas.reply();
assert.equal(ideas.ideas.black.notation,'1... d5');
assert.equal(ideas.ideas.white.notation,'1. d4');
ideas.play('c1','f4');
assert.match(ideas.ideas.white.text,/outside the pawn chain/);
ideas.reply();
assert.equal(ideas.ideas.white.notation,'2. Bf4','An automatic reply does not erase the player explanation');
assert.equal(ideas.ideas.black.notation,'1... d5','An unannotated move leaves the last labelled idea available');
ideas.restart();
assert.deepEqual(ideas.ideas,{white:null,black:null});
console.log('Move idea checks passed: revealed after play, independent sides, persistence through replies and reset.');

"use strict";

// Keep the idea beside the playback controls when there is enough horizontal room.
const compactIdeas = window.matchMedia("(max-width:600px), (orientation:landscape) and (max-height:500px)");
const opponentIdeaSlot = $("opponent-idea").parentElement;
function arrangeOpponentIdea() {
  if (compactIdeas.matches) document.querySelector(".board-column").insertBefore(opponentIdeaSlot, document.querySelector(".player-idea"));
  else document.querySelector(".opening-controls").insertBefore(opponentIdeaSlot, $("restart"));
}
compactIdeas.addEventListener("change", arrangeOpponentIdea);
arrangeOpponentIdea();

const layout = {playlistWidth: 340, boardScale: 100, showIdeas: true};
try {
  const saved = JSON.parse(localStorage.getItem("chess-openings-layout"));
  if (typeof saved?.showIdeas === "boolean") layout.showIdeas = saved.showIdeas;
  if (Number.isFinite(saved?.playlistWidth) && saved.playlistWidth >= 280 && saved.playlistWidth <= 460) layout.playlistWidth = saved.playlistWidth;
  if (Number.isFinite(saved?.boardScale) && saved.boardScale >= 65 && saved.boardScale <= 100) layout.boardScale = saved.boardScale;
} catch { /* Layout controls work without storage. */ }
function applyLayout() {
  document.body.classList.toggle("ideas-off", !layout.showIdeas);
  $("show-ideas").checked = layout.showIdeas;
  document.documentElement.style.setProperty("--playlist-width", `${layout.playlistWidth}px`);
  document.documentElement.style.setProperty("--board-scale", layout.boardScale / 100);
  $("playlist-width").value = layout.playlistWidth;
  $("board-scale").value = layout.boardScale;
  $("playlist-width-value").textContent = `${layout.playlistWidth}px`;
  $("board-scale-value").textContent = `${layout.boardScale}%`;
  try { localStorage.setItem("chess-openings-layout", JSON.stringify(layout)); } catch { /* Optional. */ }
}
for (const [id, key] of [["playlist-width", "playlistWidth"], ["board-scale", "boardScale"]]) {
  $(id).addEventListener("input", () => { layout[key] = Number($(id).value); applyLayout(); });
}
$("show-ideas").addEventListener("change", () => { layout.showIdeas = $("show-ideas").checked; applyLayout(); });
$("reset-layout").addEventListener("click", () => { layout.playlistWidth = 340; layout.boardScale = 100; applyLayout(); });
applyLayout();

const preferences = {
  opening: "london", line: "london-d5", mode: "shuffle", selected: false,
  enabled: ["london"], depth: 3, level: "beginner",
  variations: {}
};
for (const opening of OPENINGS) preferences.variations[opening.id] = opening.lines.map(line => line.id);
try {
  const saved = JSON.parse(localStorage.getItem("chess-openings-preferences"));
  if (OPENINGS.some(opening => opening.id === saved?.opening)) preferences.opening = saved.opening;
  if (["shuffle", "repeat", "repeat-one"].includes(saved?.mode)) preferences.mode = saved.mode;
  preferences.selected = saved?.selected === true;
  if (typeof saved?.line === "string") preferences.line = saved.line;
  if (Array.isArray(saved?.enabled)) preferences.enabled = OPENINGS.filter(opening => saved.enabled.includes(opening.id)).map(opening => opening.id);
  if (LEVELS.some(level => level.id === saved?.level)) preferences.level = saved.level;
  else if (saved) {
    const previous = preferences.enabled.concat(preferences.selected ? [preferences.opening] : []);
    preferences.level = LEVELS[Math.max(0, ...OPENINGS.filter(opening => previous.includes(opening.id)).map(opening => opening.level))].id;
  }
  // Migrate the previous per-mode settings once, using the depth that was active.
  const depth = saved?.depth ?? (saved?.mode && saved.mode !== "shuffle" ? saved.depths?.[saved.opening] : saved?.shuffleDepth) ?? Number(localStorage.getItem("chess-openings-depth"));
  const catalogueDepth = Math.max(...OPENINGS.flatMap(opening => opening.lines.map(line => line.moves.length / 2)));
  if (Number.isInteger(depth) && depth >= 1 && depth <= catalogueDepth) preferences.depth = depth;
  for (const opening of OPENINGS) {
    const ids = saved?.variations?.[opening.id];
    if (Array.isArray(ids)) preferences.variations[opening.id] = opening.lines.filter(line => ids.includes(line.id)).map(line => line.id);
    if (!preferences.variations[opening.id].length) preferences.enabled = preferences.enabled.filter(id => id !== opening.id);
  }
} catch { /* Saved settings and storage are optional. */ }
const savedOpening = OPENINGS.find(opening => opening.id === preferences.opening);
if (!savedOpening.lines.some(line => line.id === preferences.line)) preferences.line = savedOpening.lines[0].id;
const levelRank = () => LEVELS.findIndex(level => level.id === preferences.level);
const isAvailable = id => OPENINGS.find(opening => opening.id === id).level <= levelRank();
const visibleOpenings = () => OPENINGS.filter(opening => opening.level <= levelRank()).sort((a,b) => a.level - b.level);
const activeEnabled = () => preferences.enabled.filter(isAvailable);
if (!isAvailable(preferences.opening)) { preferences.selected = false; preferences.mode = "shuffle"; }
const findOpening = id => OPENINGS.find(opening => opening.id === id);
const enabledLines = id => preferences.enabled.includes(id) && isAvailable(id) ? findOpening(id).lines.filter(line => preferences.variations[id].includes(line.id)) : [];
function practiceLines(id) {
  const lines = enabledLines(id);
  const chosen = id === preferences.opening && findOpening(id).lines.find(line => line.id === preferences.line);
  if (preferences.selected && chosen && !lines.includes(chosen)) return [...lines, chosen];
  return lines;
}
let practice = null, activeOpening = null, selected = null, replyTimer = null;
let wrongMove = null, resetTimer = null;
let sessions = new Map();
const completionNotices = new WeakMap();
const attentionTimers = new Map();
function drawAttention(element) {
  clearTimeout(attentionTimers.get(element));
  element.classList.add("attention");
  attentionTimers.set(element, setTimeout(() => { element.classList.remove("attention"); attentionTimers.delete(element); }, 2000));
}
function savePreferences() {
  try { localStorage.setItem("chess-openings-preferences", JSON.stringify(preferences)); } catch { /* Optional. */ }
}
function pool() {
  return preferences.mode === "shuffle" ? activeEnabled() : (practiceLines(preferences.opening).length ? [preferences.opening] : []);
}
function maxDepth() {
  const enabled = activeEnabled().flatMap(enabledLines);
  const lines = enabled.length ? enabled : visibleOpenings().flatMap(opening => opening.lines);
  return Math.max(...lines.map(line => line.moves.length / 2));
}

const visibleSessions = () => pool().map(id => sessions.get(id)).filter(Boolean);
const depthComplete = () => visibleSessions().length > 0 && visibleSessions().every(session => session.depthComplete);
function cancelReply() {
  clearTimeout(replyTimer);
  replyTimer = null;
  clearTimeout(resetTimer);
  resetTimer = null;
  wrongMove = null;
  selected = null;
}
function settingsPanel() {
  const focused = document.activeElement?.dataset.choice;
  const scrollTop = $("opening-tree").scrollTop;
  $("opening-tree").replaceChildren();
  $("player-level").value = preferences.level;
  const hidden = preferences.enabled.filter(id => !isAvailable(id)).length;
  $("level-note").textContent = `${LEVELS[levelRank()].description} ${visibleOpenings().length} repertoire choices.${hidden ? ` ${hidden} checked above this level ${hidden === 1 ? "is" : "are"} paused.` : ""}`;
  let lastLevel = -1;
  for (const opening of visibleOpenings()) {
    if (opening.level !== lastLevel) {
      const heading = document.createElement("h3");
      heading.className = "opening-level-heading";
      heading.textContent = LEVELS[opening.level].name;
      $("opening-tree").append(heading);
      lastLevel = opening.level;
    }
    const group = document.createElement("div");
    group.className = "opening-group";
    const ids = preferences.variations[opening.id];
    const enabled = preferences.enabled.includes(opening.id);
    function checkboxRow(text, id, parent = false) {
      const row = document.createElement("div"), checkbox = document.createElement("input"), title = document.createElement("button");
      row.className = parent ? "opening-choice" : "variation-choice";
      title.type = "button";
      title.className = "playlist-title";
      const side = document.createElement("span");
      side.className = `repertoire-side ${opening.side}`;
      side.textContent = opening.side === "black" ? "Black" : "White";
      const name = document.createElement("span");
      name.className = "playlist-name";
      name.textContent = text;
      title.append(name, side);
      title.title = `${text} · ${opening.side === "black" ? "Black" : "White"} · ${LEVELS[opening.level].name}`;
      title.dataset.select = id;
      title.addEventListener("click", () => selectPlaylist(opening.id, parent ? null : id));
      checkbox.type = "checkbox";
      checkbox.setAttribute("aria-label", `Include ${text} as ${opening.side}`);
      checkbox.dataset.choice = id;
      checkbox.checked = parent ? enabled : enabled && ids.includes(id);
      const partial = parent && enabled && ids.length > 0 && ids.length < opening.lines.length;
      checkbox.indeterminate = partial;
      checkbox.addEventListener("change", () => {
        if (parent) {
          preferences.variations[opening.id] = partial || checkbox.checked ? opening.lines.map(line => line.id) : [];
        } else {
          const chosen = new Set(enabled ? ids : []);
          if (checkbox.checked) chosen.add(id); else chosen.delete(id);
          preferences.variations[opening.id] = opening.lines.filter(line => chosen.has(line.id)).map(line => line.id);
        }
        preferences.enabled = OPENINGS.filter(item => preferences.variations[item.id].length > 0 &&
          (item.id === opening.id || preferences.enabled.includes(item.id))).map(item => item.id);
        preferences.selected = false;
        if (!preferences.enabled.includes(preferences.opening) ||
            (preferences.mode === "repeat-one" && !practiceLines(preferences.opening).some(line => line.id === preferences.line))) {
          preferences.mode = "shuffle";
        }
        savePreferences();
        settingsPanel();
        startSession();
      });
      row.append(checkbox, title);
      group.append(row);
    }
    checkboxRow(opening.name, opening.id, true);
    if (opening.lines.length > 1) for (const line of opening.lines) checkboxRow(line.name, line.id);
    $("opening-tree").append(group);
  }
  $("opening-tree").scrollTop = scrollTop;
  if (focused) $("opening-tree").querySelector(`[data-choice="${focused}"]`)?.focus({preventScroll: true});
}
function chooseNextOpening() {
  if (preferences.mode === "shuffle") for (const id of pool()) {
    const session = sessions.get(id), checked = enabledLines(id);
    if (session.lines.length !== checked.length || session.lines.some(line => !checked.includes(line))) {
      // Clicking an unchecked name plays it now, but never adds it to future shuffles.
      const next = new OpeningPractice(session.depth, checked, findOpening(id).side);
      next.lineIndex = Math.max(0, checked.findIndex(line => line.id === session.targetLine.id));
      for (const key of ["mistakes", "coverage", "completed", "restarts"]) next[key] = session[key];
      sessions.set(id, next);
    }
    sessions.get(id).pinLine(null);
  }
  const unfinished = pool().filter(id => !sessions.get(id).depthComplete);
  const candidates = unfinished.length ? unfinished : pool();
  const different = candidates.filter(id => id !== activeOpening);
  const choices = different.length ? different : candidates;
  activeOpening = choices[Math.floor(Math.random() * choices.length)];
  practice = sessions.get(activeOpening) || null;
}
function depthOptions() {
  $("depth").replaceChildren();
  for (let value = 1; value <= maxDepth(); value++) {
    const option = document.createElement("option");
    option.value = value; option.textContent = `Up to ${value}`;
    $("depth").append(option);
  }
  $("depth").value = preferences.depth;
}
function rememberCurrent() {
  if (practice) {
    preferences.opening = activeOpening;
    preferences.line = practice.targetLine.id;
  }
  savePreferences();
}
function startSession(depth = preferences.depth, reset = true) {
  cancelReply();
  if (!activeEnabled().includes(preferences.opening) && !preferences.selected) preferences.mode = "shuffle";
  if (preferences.mode === "repeat-one" && !practiceLines(preferences.opening).some(line => line.id === preferences.line)) {
    preferences.line = practiceLines(preferences.opening)[0].id;
  }
  depth = Math.min(depth, maxDepth());
  preferences.depth = depth;
  const ids = [...new Set([...pool(), ...(preferences.selected ? [preferences.opening] : [])])];
  sessions = new Map(ids.map(id => {
    const session = reset ? null : sessions.get(id);
    const target = session?.targetLine.id || (id === preferences.opening ? preferences.line : null);
    if (session) session.setDepth(depth);
    const next = session || new OpeningPractice(depth, practiceLines(id), findOpening(id).side);
    next.lineIndex = Math.max(0, next.lines.findIndex(line => line.id === target));
    next.pinLine(preferences.mode === "repeat-one" ? preferences.line : null);
    return [id, next];
  }));
  activeOpening = null;
  if (preferences.selected) { activeOpening = preferences.opening; practice = sessions.get(activeOpening); }
  else chooseNextOpening();
  rememberCurrent(); depthOptions(); render();
}
function selectPlaylist(id, lineId = null) {
  cancelReply();
  const depth = preferences.depth;
  preferences.opening = id;
  preferences.line = lineId || enabledLines(id)[0]?.id || findOpening(id).lines[0].id;
  preferences.selected = true;
  const session = new OpeningPractice(depth, practiceLines(id), findOpening(id).side);
  session.lineIndex = session.lines.findIndex(line => line.id === preferences.line);
  if (preferences.mode === "repeat-one") session.pinLine(preferences.line);
  sessions.set(id, session);
  activeOpening = id;
  practice = session;
  for (const other of pool()) {
    if (!sessions.has(other)) sessions.set(other, new OpeningPractice(practice.depth, practiceLines(other), findOpening(other).side));
    else if (sessions.get(other).depth !== practice.depth) sessions.get(other).setDepth(practice.depth);
  }
  rememberCurrent(); depthOptions(); render();
}
function setMode(mode) {
  if (!practice || preferences.mode === mode) return;
  preferences.opening = activeOpening;
  preferences.line = practice.targetLine.id;
  preferences.mode = mode;
  preferences.selected = true;
  // Pin before advancing or restarting, including while Black's reply is pending.
  practice.pinLine(mode === "repeat-one" ? preferences.line : null);
  for (const id of pool()) {
    if (!sessions.has(id)) sessions.set(id, new OpeningPractice(practice.depth, practiceLines(id), findOpening(id).side));
    else if (sessions.get(id).depth !== practice.depth) sessions.get(id).setDepth(practice.depth);
    if (id !== activeOpening) sessions.get(id).pinLine(null);
  }
  rememberCurrent(); depthOptions(); render();
}
function render(message = "") {
  const boardState = wrongMove ? {board: wrongMove.board, userToMove: false, hintLevel: 0} : practice || {board: startingPosition(), userToMove: false, hintLevel: 0};
  const focus = document.activeElement?.dataset.square;
  const board = $("board");
  board.replaceChildren();
  board.style.setProperty("--size", 8);
  const flipped = practice?.side === "black";
  const player = flipped ? "Black" : "White";
  const opponent = flipped ? "White" : "Black";
  renderCoordinates(board, 8, flipped);
  board.setAttribute("aria-label", `Chess board, ${player} at the bottom`);
  $("playing-side").textContent = practice ? `Playing as ${player}` : "Choose either side";
  const suggestions = boardState.userToMove && boardState.hintLevel ? boardState.suggestions : [];
  const ranks = flipped ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1];
  const files = flipped ? "hgfedcba" : "abcdefgh";
  for (const rank of ranks) for (const file of files) {
    const col = file.charCodeAt(0) - 97;
    const square = `${file}${rank}`, piece = boardState.board[square];
    const source = suggestions.some((move) => move[0] === square);
    const ghost = boardState.hintLevel >= 2 && suggestions.find((move) => move[1] === square);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `square${(col + rank) % 2 ? " dark" : ""}${source ? " hint-source" : ""}${square === selected ? " selected" : ""}${ghost ? " hint-destination" : ""}`;
    button.dataset.square = square;
    if (wrongMove?.square === square) button.classList.add("mistake-square");
    button.setAttribute("aria-label", `${square.toUpperCase()}, ${piece ? pieceName(piece) : "empty"}${source ? ", suggested piece" : ""}${ghost ? ", suggested destination" : ""}${wrongMove?.square === square ? ", incorrect move" : ""}`);
    button.setAttribute("aria-pressed", String(selected === square));
    if (piece) button.append(pieceElement(piece));
    if (ghost) {
      const preview = pieceElement(boardState.board[ghost[0]]);
      preview.classList.add("ghost-piece");
      button.append(preview);
    }
    button.addEventListener("click", () => choose(square));
    button.draggable = boardState.userToMove && piece?.[0] === (flipped ? "b" : "w");
    button.addEventListener("dragstart", (event) => {
      selected = square;
      event.dataTransfer.setData("text/plain", square);
      event.dataTransfer.effectAllowed = "move";
    });
    button.addEventListener("dragover", (event) => {
      if (boardState.userToMove && selected) event.preventDefault();
    });
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      if (boardState.userToMove && selected === event.dataTransfer.getData("text/plain")) choose(square);
    });
    board.append(button);
  }
  if (focus) board.querySelector(`[data-square="${focus}"]`)?.focus({preventScroll: true});
  const available = Boolean(practice);
  for (const title of document.querySelectorAll("[data-select]")) {
    const playing = title.dataset.select === activeOpening ||
      (practice?.candidates.length === 1 && title.dataset.select === practice.targetLine.id);
    if (playing) title.setAttribute("aria-current", "true");
    else title.removeAttribute("aria-current");
  }
  for (const button of document.querySelectorAll("[data-mode]")) {
    button.setAttribute("aria-pressed", String(button.dataset.mode === preferences.mode));
    button.disabled = !available;
  }
  $("depth").disabled = !available;
  $("restart").disabled = !available;
  $("again").hidden = !practice?.complete;
  $("deeper").hidden = !practice?.complete || !depthComplete() || preferences.depth === maxDepth();
  $("instruction").textContent = available ? findOpening(activeOpening).name : "Choose an opening";
  $("instruction").title = $("instruction").textContent;
  $("phase").textContent = wrongMove ? "OUTSIDE THIS LINE" : !available ? "READY" : practice.complete ? (depthComplete() ? "DEPTH COMPLETE" : "LINE COMPLETE") : practice.userToMove ? `YOUR TURN · ${player.toUpperCase()}` : `${opponent.toUpperCase()}'S REPLY`;
  $("badge").textContent = available ? `${Math.floor(practice.ply / 2)} / ${practice.targetDepth}` : "White";
  const targets = visibleSessions();
  const total = targets.reduce((n, session) => n + session.lineCount, 0);
  const covered = targets.reduce((n, session) => n + [...session.requiredPrefixes].filter(prefix => session.coverage.has(prefix)).length, 0);
  $("coverage").textContent = available ? `${covered} / ${total} lines · up to ${preferences.depth} moves per side` : "No openings selected";
  $("completed").textContent = [...sessions.values()].reduce((n, session) => n + session.completed, 0);
  $("mistakes").textContent = [...sessions.values()].reduce((n, session) => n + session.restarts, 0);
  const modeText = {shuffle: "Shuffle · checked openings", repeat: "Repeat · current opening", "repeat-one": "Repeat 1 · current variation"};
  $("mode-note").textContent = modeText[preferences.mode];
  $("status").classList.toggle("error", Boolean(wrongMove));
  $("status").classList.toggle("success", Boolean(practice?.complete && !wrongMove));
  $("again").classList.toggle("primary", Boolean(practice?.complete));
  if (!practice?.complete) for (const element of [$("status"), $("again")]) {
    clearTimeout(attentionTimers.get(element));
    attentionTimers.delete(element);
    element.classList.remove("attention");
  }
  $("status").textContent = wrongMove ? wrongMove.message : message || (!available ? "Tick an opening in the list to start practising." : practice.complete ? (depthComplete() ? "Well done. Repeat this depth or add the next move." : "Well done — line complete. Continue with the next line.") : practice.userToMove ? `Select a ${player} piece, then its destination.` : `${opponent} is replying…`);
  $("hint").textContent = !available || wrongMove || !practice.userToMove || !practice.hintLevel ? "" : practice.hintLevel === 1 ? `Hint: move the highlighted ${pieceName(practice.board[suggestions[0][0]]).toLowerCase()} on ${suggestions[0][0].toUpperCase()}.` : `Hint: ${suggestions.map(([from, to]) => `${from.toUpperCase()} → ${to.toUpperCase()}`).join(" or ")}. Move to the ghost piece.`;
  if (practice?.complete && completionNotices.get(practice) !== practice.completed) {
    completionNotices.set(practice, practice.completed);
    drawAttention($("status"));
    drawAttention($("again"));
  }
  $("again").textContent = preferences.mode === "repeat-one" ? "Practise again" : "Next line";
  const pairs = [];
  for (let i = 0; i < (practice?.history.length || 0); i += 2) pairs.push(`${i / 2 + 1}. ${practice.history[i]} ${practice.history[i + 1] || "…"}`);
  $("moves").textContent = pairs.join("   ") || "Your moves will appear here.";
  renderIdea("opponent-idea", practice?.ideas[flipped ? "white" : "black"], `${opponent}’s idea`, Boolean(wrongMove));
  renderIdea("player-idea", practice?.ideas[flipped ? "black" : "white"], "Your idea", Boolean(wrongMove));
  queueOpponent();
}
function renderIdea(id, idea, label, hide) {
  const card = $(id);
  card.hidden = !idea || hide;
  if (card.hidden) return;
  const heading = `${label} · ${idea.notation}`;
  if (card.querySelector("h3").textContent !== heading) card.querySelector("h3").textContent = heading;
  if (card.querySelector("p").textContent !== idea.text) card.querySelector("p").textContent = idea.text;
}
function queueOpponent() {
  if (!practice || practice.complete || practice.userToMove || wrongMove || replyTimer !== null) return;
  replyTimer = setTimeout(() => {
    replyTimer = null;
    practice.reply();
    rememberCurrent(); render();
  }, 450);
}
function choose(square) {
  if (wrongMove || !practice?.userToMove) return;
  if (selected === square) { selected = null; render(); return; }
  if (practice.board[square]?.[0] === practice.side[0]) { selected = square; render(); return; }
  if (!selected) return;
  const from = selected, target = practice.targetLine.id;
  selected = null;
  const attempted = {...practice.board};
  attempted[square] = attempted[from];
  delete attempted[from];
  const result = practice.play(from, square);
  if (!result.correct) {
    wrongMove = {board: attempted, square, message: `${from.toUpperCase()} → ${square.toUpperCase()} isn't in this line (${practice.side === 'black' ? 'Black' : 'White'}'s move ${result.failedMove}). Restarting… Repeat 1 is on.`};
    preferences.line = target;
    const changedMode = preferences.mode !== "repeat-one";
    setMode("repeat-one");
    if (changedMode) drawAttention(document.querySelector('[data-mode="repeat-one"]'));
    render();
    resetTimer = setTimeout(() => {
      resetTimer = null;
      wrongMove = null;
      render("Back to the start. Repeat 1 is on so you can practise this variation.");
    }, 1600);
    return;
  }
  rememberCurrent(); render();

}
function restart() {
  cancelReply();
  practice?.restart();
  rememberCurrent(); render();
}
$("restart").addEventListener("click", restart);
$("again").addEventListener("click", () => {
  cancelReply();
  practice.restart();
  if (preferences.mode === "shuffle") {
    preferences.selected = false;
    chooseNextOpening();
  } else if (preferences.mode === "repeat") {
    // A name can bring an unchecked line onto the board once without queuing it.
    const checked = enabledLines(activeOpening);
    if (checked.length && practice.lines.some(line => !checked.includes(line))) {
      const next = new OpeningPractice(practice.depth, checked, findOpening(activeOpening).side);
      for (const key of ["mistakes", "coverage", "completed", "restarts"]) next[key] = practice[key];
      practice = next;
      sessions.set(activeOpening, next);
    }
  }
  rememberCurrent(); render();
});
$("deeper").addEventListener("click", () => startSession(preferences.depth + 1, false));
$("depth").addEventListener("change", () => startSession(Number($("depth").value), false));
for (const button of document.querySelectorAll("[data-mode]")) button.addEventListener("click", () => setMode(button.dataset.mode));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { selected = null; render(); }
});
for (const level of LEVELS) {
  const option = document.createElement("option");
  option.value = level.id; option.textContent = level.name;
  $("player-level").append(option);
}
$("player-level").addEventListener("change", () => {
  preferences.level = $("player-level").value;
  settingsPanel();
  $("opening-tree").scrollTop = 0;
  savePreferences();
  if (!practice || !isAvailable(activeOpening) || preferences.depth > maxDepth()) {
    preferences.selected = false;
    if (!isAvailable(preferences.opening)) preferences.mode = "shuffle";
    startSession();
  } else {
    for (const id of pool()) if (!sessions.has(id)) sessions.set(id, new OpeningPractice(preferences.depth, practiceLines(id), findOpening(id).side));
    depthOptions(); render();
  }
});
settingsPanel();
startSession();

"use strict";

const modes = ["memory_fixed", "memory_progressive", "threats_fixed", "threats_progressive", "random_fixed", "random_progressive"];
const normalizeMode = (mode) => ({fixed: "memory_fixed", progressive: "memory_progressive"}[mode] || mode);
const marking = () => round?.question?.answer_kind === "marks";
let phase = "ready", round = null, placement = {}, selected = null, result = null;
let original = false, busy = false, animation = null, deadline = 0, lastSecond = -1;

for (let size = 3; size <= 8; size++) {
  const option = document.createElement("option");
  option.value = size;
  option.textContent = `${size} × ${size}${size === 8 ? " · full board" : ""}`;
  $("size").append(option);
}
try {
  const saved = JSON.parse(localStorage.getItem("chess-memory-settings"));
  if (saved && modes.includes(normalizeMode(saved.mode)) && Number.isInteger(saved.size) && saved.size >= 3 && saved.size <= 8 && Number.isInteger(saved.count) && saved.count >= 1 && saved.count <= Math.min(32, saved.size ** 2) && Number.isInteger(saved.seconds) && saved.seconds >= 2 && saved.seconds <= 60) {
    saved.mode = normalizeMode(saved.mode);
    for (const key of ["mode", "size", "count", "seconds"]) $(key).value = saved[key];
    if (["puzzle", "all"].includes(saved.palette)) $("palette").value = saved.palette;
  }
} catch { /* Storage is optional, including in private browsing. */ }

function settings() {
  return {mode: $("mode").value, palette: $("palette").value, size: Number($("size").value), count: Number($("count").value), seconds: Number($("seconds").value)};
}
function saveSettings() {
  try { localStorage.setItem("chess-memory-settings", JSON.stringify(settings())); } catch { /* Optional. */ }
}
function showStatus(message, error = false) {
  $("status").textContent = message;
  $("status").classList.toggle("error", error);
}
function progress(data) {
  $("rounds").textContent = data.rounds;
  $("perfects").textContent = data.perfects;
  $("streak").textContent = data.mode.endsWith("_progressive") ? `${Math.min(data.streak, 3)} / 3` : data.streak;
}
function isSelected(piece, from = null) {
  return selected !== null && selected.piece === piece && selected.from === from;
}
function remaining(piece) {
  return round.inventory[piece] - Object.values(placement).filter((p) => p === piece).length;
}
function makeDraggable(button, piece, from = null) {
  button.draggable = phase === "recall";
  button.addEventListener("dragstart", (event) => {
    if (phase !== "recall" || busy) { event.preventDefault(); return; }
    selected = {piece, from};
    event.dataTransfer.setData("text/plain", JSON.stringify(selected));
    event.dataTransfer.effectAllowed = "move";
    document.body.classList.add("dragging");
  });
  button.addEventListener("dragend", () => {
    document.body.classList.remove("dragging");
    render();
  });
}
function render() {
  const size = round ? round.size : Number($("size").value);
  const position = phase === "study" ? round.position : phase === "review" && original && marking() ? result.position : phase === "review" && original ? result.target : placement;
  const board = $("board");
  // Preserve keyboard focus when the board is rebuilt after a placement.
  const focusedSquare = document.activeElement?.dataset.square;
  const focusedPiece = document.activeElement?.dataset.piece;
  board.replaceChildren();
  board.style.setProperty("--size", size);
  renderCoordinates(board, size);
  board.setAttribute("aria-label", `${size} by ${size} chess board`);
  $("badge").textContent = `${size} × ${size}`;
  for (let row = size; row >= 1; row--) {
    for (let col = 0; col < size; col++) {
      const square = `${String.fromCharCode(97 + col)}${row}`;
      const piece = position[square];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `square${(col + row) % 2 ? " dark" : ""}`;
      button.dataset.square = square;
      const mark = marking() && phase === "review" && original ? result.target[square] : isMark(piece) ? piece : null;
      button.setAttribute("aria-label", `${square.toUpperCase()}, ${piece && !isMark(piece) ? pieceName(piece) : "empty"}${mark ? `, ${round.question.markers[mark]}` : ""}`);
      if (marking() && phase === "recall") button.setAttribute("aria-pressed", String(Boolean(mark)));
      if (phase === "recall" && isSelected(piece, square)) button.classList.add("selected");
      if (phase === "review" && !original && (piece || result.target[square])) {
        button.classList.add(result.correct.includes(square) ? "correct" : "wrong");
      }
      if (piece) { button.append(pieceElement(piece)); if (phase === "recall") makeDraggable(button, piece, square); }
      if (mark && !isMark(piece)) button.append(pieceElement(mark));
      button.addEventListener("click", () => {
        if (phase !== "recall" || busy) return;
        if (marking()) {
          const tool = selected?.piece || Object.keys(round.question.markers)[0];
          if (placement[square] === tool) delete placement[square];
          else placement[square] = tool;
          selected = {piece: tool, from: null};
          showMarkCount();
          render();
          return;
        }
        if (selected && !isSelected(piece, square)) place(selected, square);
        else { selected = isSelected(piece, square) || !piece ? null : {piece, from: square}; render(); }
      });
      button.addEventListener("dragover", (event) => {
        if (phase === "recall" && selected && !busy) { event.preventDefault(); button.classList.add("drop-target"); }
      });
      button.addEventListener("dragleave", () => button.classList.remove("drop-target"));
      button.addEventListener("drop", (event) => {
        event.preventDefault();
        if (phase === "recall" && !busy && JSON.stringify(selected) === event.dataTransfer.getData("text/plain")) place(selected, square);
      });
      board.append(button);
    }
  }
  $("tray").replaceChildren();
  $("tray").classList.toggle("all-pieces", !marking() && round?.palette === "all");
  if (phase === "recall" && marking()) {
    for (const [index, [marker, label]] of Object.entries(round.question.markers).entries()) {
      const button = document.createElement("button");
      button.id = index === 0 ? "mark-tool" : `mark-tool-${marker}`;
      button.className = "mark-tool";
      button.dataset.piece = marker;
      button.type = "button";
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", String(selected?.piece === marker));
      if (selected?.piece === marker) button.classList.add("selected");
      button.append(pieceElement(marker));
      const text = document.createElement("span");
      text.className = "marker-label";
      text.textContent = label;
      button.append(text);
      button.disabled = busy;
      makeDraggable(button, marker);
      button.addEventListener("click", () => { selected = {piece: marker, from: null}; render(); });
      $("tray").append(button);
    }
  } else if (phase === "recall") {
    for (const piece of round.pieces) {
      const button = document.createElement("button");
      const count = remaining(piece);
      button.type = "button";
      button.disabled = count === 0 || busy;
      button.dataset.piece = piece;
      button.setAttribute("aria-label", `${pieceName(piece)}, ${count} remaining`);
      button.setAttribute("aria-pressed", String(isSelected(piece)));
      button.title = `${pieceName(piece)} · ${count} remaining`;
      if (isSelected(piece)) button.classList.add("selected");
      button.append(pieceElement(piece));
      const badge = document.createElement("span");
      badge.className = "remaining";
      badge.textContent = `×${count}`;
      badge.setAttribute("aria-hidden", "true");
      button.append(badge);
      if (count > 0) makeDraggable(button, piece);
      button.addEventListener("click", () => { if (!busy) { selected = isSelected(piece) ? null : {piece, from: null}; render(); } });
      $("tray").append(button);
    }
  }
  $("remove").disabled = !selected?.from || busy;
  $("clear").disabled = !Object.keys(placement).length || busy;
  $("check").disabled = busy;
  for (const key of ["hide", "remove", "clear", "check", "compare", "next"]) {
    $(key).hidden = !({study: ["hide"], recall: ["remove", "clear", "check"], review: ["compare", "next"]}[phase] || []).includes(key);
  }
  $("reveal").hidden = phase !== "revealing" || busy;
  if (marking()) $("remove").hidden = true;
  $("check").textContent = marking() ? "Check my marks" : "Check my board";
  $("start").disabled = busy || ["study", "recall"].includes(phase);
  for (const key of ["mode", "size", "palette", "count", "seconds"]) $(key).disabled = busy || ["study", "recall", "revealing"].includes(phase);
  if ($("mode").value.startsWith("threats_")) $("palette").disabled = true;
  $("next").disabled = busy;
  if (focusedSquare) board.querySelector(`[data-square="${focusedSquare}"]`)?.focus();
  else if (focusedPiece) $("tray").querySelector(`[data-piece="${focusedPiece}"]`)?.focus();
}
function place(choice, square) {
  const {piece, from: previous} = choice;
  if (marking()) {
    if (!Object.hasOwn(round.question.markers, piece)) return;
    if (previous) delete placement[previous];
    placement[square] = piece;
    selected = {piece, from: null};
    showMarkCount();
    render();
    return;
  }
  if (!round.pieces.includes(piece)) return;
  if (previous ? placement[previous] !== piece : remaining(piece) <= 0) return;
  const displaced = placement[square];
  if (previous) delete placement[previous];
  placement[square] = piece;
  if (previous && displaced) placement[previous] = displaced;
  selected = null;
  showStatus(`${Object.keys(placement).length} pieces placed · ${round.count} in the puzzle. Select a piece to move it.`);
  render();
}
function showMarkCount() {
  const count = Object.keys(placement).length;
  showStatus(`${count} ${count === 1 ? "square" : "squares"} marked. Tap with the same symbol to remove a mark.`);
}
async function api(endpoint, data) {
  const response = await fetch(`/api/${endpoint}`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)});
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || "The server could not complete that request.");
  return value;
}
async function start(event) {
  event?.preventDefault();
  if (busy || !$("settings").reportValidity()) return;
  busy = true;
  render();
  showStatus("Preparing your position…");
  try {
    const next = await api("start", settings());
    cancelAnimationFrame(animation);
    round = next; placement = {}; selected = null; result = null; original = false;
    phase = "study";
    progress(next.progress);
    saveSettings();
    $("phase").textContent = "01 / STUDY";
    $("instruction").textContent = "Study the position";
    $("question-prompt").textContent = "";
    $("question-prompt").hidden = true;
    $("question-note").textContent = "";
    $("question-note").hidden = true;
    lastSecond = -1;
    deadline = performance.now() + next.seconds * 1000;
    render();
    tick();
    $("board").closest(".play").scrollIntoView({block: "nearest"});
    $("hide").focus();
  } catch (error) { showStatus(`${error.message} Check that the Python server is running, then try again.`, true); }
  finally { busy = false; render(); }
}
function tick() {
  if (phase !== "study") return;
  const remaining = Math.max(0, deadline - performance.now());
  $("timer-bar").style.width = `${remaining / (round.seconds * 1000) * 100}%`;
  const second = Math.ceil(remaining / 1000);
  if (second !== lastSecond) {
    showStatus(`${second} seconds to study · ${round.count} pieces`);
    lastSecond = second;
  }
  if (!remaining) hide();
  else animation = requestAnimationFrame(tick);
}
async function hide() {
  if (phase !== "study") return;
  cancelAnimationFrame(animation);
  phase = "revealing";
  // Keep no reference-position rendering in the DOM during recall.
  round.position = null;
  $("timer-bar").style.width = "0%";
  $("instruction").textContent = "Position hidden";
  showStatus("Getting your question…");
  render();
  await revealQuestion();
}
async function revealQuestion() {
  if (phase !== "revealing" || busy) return;
  busy = true;
  render();
  try {
    const response = await api("reveal", {id: round.id});
    round.question = response.question;
    phase = "recall";
    $("phase").textContent = marking() ? "02 / MARK THREATS" : "02 / REBUILD";
    $("instruction").textContent = round.question.prompt;
    $("question-prompt").hidden = true;
    $("question-prompt").textContent = round.question.prompt;
    $("question-note").textContent = round.question.note;
    $("question-note").hidden = !round.question.note;
    if (marking()) selected = {piece: Object.keys(round.question.markers)[0], from: null};
    showStatus(marking() ? "Choose a symbol, then drag or tap to mark the remembered threats." : "Drag a piece onto the board, or select it and tap a square. There’s no time limit.");
  } catch (error) { showStatus(`${error.message} The position stays hidden. Retry getting the question.`, true); }
  finally { busy = false; }
  render();
  $("tray").querySelector("button")?.focus();
}
$("settings").addEventListener("submit", start);
$("next").addEventListener("click", start);
$("hide").addEventListener("click", hide);
$("reveal").addEventListener("click", revealQuestion);
$("remove").addEventListener("click", returnSelected);
function returnSelected() {
  if (phase !== "recall" || busy) return;
  if (selected?.from) delete placement[selected.from];
  selected = null;
  render();
  showStatus("Piece returned to the tray.");
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Delete" && phase === "recall" && selected) { event.preventDefault(); returnSelected(); }
  if (event.key === "Escape" && selected) { selected = null; render(); }
});
$("clear").addEventListener("click", () => { if (!busy) { placement = {}; selected = marking() ? {piece: selected?.piece || Object.keys(round.question.markers)[0], from: null} : null; render(); showStatus(marking() ? "Marks cleared. Mark the threats from memory." : "Board cleared. Rebuild the position from memory."); } });
$("check").addEventListener("click", async () => {
  if (busy || phase !== "recall") return;
  busy = true; render();
  try {
    result = await api("check", {id: round.id, placement});
    phase = "review"; selected = null; original = false;
    progress(result.progress);
    $("phase").textContent = "03 / REVIEW";
    $("instruction").textContent = result.perfect ? marking() ? "All threats correct" : "All pieces correct" : "Review your answer";
    $("question-prompt").hidden = !marking();
    const extraNoun = marking() ? "mark" : "piece";
    showStatus(`${result.correct.length} of ${result.total} ${marking() ? "threats" : "pieces"} correct.${result.extra.length ? ` ${result.extra.length} extra ${extraNoun}${result.extra.length === 1 ? "" : "s"}.` : ""}${result.advanced ? ` Next board: ${result.progress.size} × ${result.progress.size}.` : result.perfect ? "" : " Compare your board with the original."}`);
    $("size").value = result.progress.size;
    $("compare").textContent = marking() ? "Show correct threats" : "Show original";
    saveSettings();
  } catch (error) { showStatus(`${error.message} Your answer is still here. You can try checking again.`, true); }
  finally { busy = false; render(); if (phase === "review") $("next").focus(); }
});
$("compare").addEventListener("click", () => {
  original = !original;
  $("compare").textContent = original ? "Show my answer" : marking() ? "Show correct threats" : "Show original";
  $("instruction").textContent = original ? marking() ? "Original position and correct threats" : "The original position." : "Your remembered position.";
  render();
});
function settingsChanged() {
  const max = Math.min(32, Number($("size").value) ** 2);
  $("count").max = max;
  if (Number($("count").value) > max) $("count").value = max;
  $("mode-help").textContent = ($("mode").value.endsWith("_progressive") ? "The board grows after three perfect rounds in a row." : "The board stays at the selected size.") + ($("mode").value.startsWith("random_") ? " Questions are drawn from a shuffled bag." : "");
  saveSettings();
  render();
}
$("settings").addEventListener("change", settingsChanged);
// A background tab must not gain extra study time when it becomes visible again.
document.addEventListener("visibilitychange", () => { if (phase === "study" && performance.now() >= deadline) hide(); });
settingsChanged();
render();

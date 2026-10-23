"use strict";

const $ = (id) => document.getElementById(id);
// Local vector silhouettes: consistent rendering without a system chess font.
const silhouettes = {
  K: ["M27 7H37V14H44V23H37V29H27V23H20V14H27Z", "M20 32H44L39 42L43 49H21L25 42Z"],
  Q: ["M15 20L25 29L32 14L39 29L49 20L43 43H21Z", "M21 43H43V49H21Z"],
  R: ["M17 12H25V20H29V12H35V20H39V12H47V29H42V43L46 49H18L22 43V29H17Z"],
  B: ["M32 9C22 17 18 23 20 30C21 35 26 37 28 38L23 49H41L36 38C45 34 47 25 40 18Z"],
  N: ["M18 49L20 37L28 27L20 31L12 26L20 15L32 12L36 6L39 14C49 21 49 35 46 49Z"],
  P: ["M27 29H37L36 36L42 49H22L28 36Z"]
};
const svgNS = "http://www.w3.org/2000/svg";
const themeButton = $("theme-toggle");
let theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
try {
  const saved = localStorage.getItem("chess-memory-theme");
  if (["light", "dark"].includes(saved)) theme = saved;
} catch { /* Theme still works when storage is unavailable. */ }
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}
applyTheme();
themeButton.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  applyTheme();
  try { localStorage.setItem("chess-memory-theme", theme); } catch { /* Optional. */ }
});
const names = {K: "king", Q: "queen", R: "rook", B: "bishop", N: "knight", P: "pawn"};
const pieceName = (piece) => `${piece[0] === "w" ? "White" : "Black"} ${names[piece[1]]}`;
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
  if (saved && ["progressive", "fixed"].includes(saved.mode) && Number.isInteger(saved.size) && saved.size >= 3 && saved.size <= 8 && Number.isInteger(saved.count) && saved.count >= 1 && saved.count <= Math.min(32, saved.size ** 2) && Number.isInteger(saved.seconds) && saved.seconds >= 2 && saved.seconds <= 60) {
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
  $("streak").textContent = data.mode === "progressive" ? `${Math.min(data.streak, 3)} / 3` : data.streak;
}
function pieceElement(piece) {
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", `piece ${piece[0] === "w" ? "white-piece" : "black-piece"}`);
  svg.setAttribute("viewBox", "8 4 48 56");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  function path(d, detail = false) {
    const node = document.createElementNS(svgNS, "path");
    node.setAttribute("d", d);
    if (detail) node.setAttribute("class", "piece-detail");
    svg.append(node);
  }
  for (const d of silhouettes[piece[1]]) path(d);
  if (piece[1] === "P") {
    const head = document.createElementNS(svgNS, "circle");
    head.setAttribute("cx", "32"); head.setAttribute("cy", "20"); head.setAttribute("r", "10");
    svg.append(head);
  }
  if (piece[1] === "B") path("M36 17L28 28", true);
  if (piece[1] === "N") path("M26 20H28", true);
  path("M17 49H47L50 57H14Z");
  return svg;
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
  const position = phase === "study" ? round.position : phase === "review" && original ? result.target : placement;
  const board = $("board");
  // Preserve keyboard focus when the board is rebuilt after a placement.
  const focusedSquare = document.activeElement?.dataset.square;
  const focusedPiece = document.activeElement?.dataset.piece;
  board.replaceChildren();
  board.style.setProperty("--size", size);
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
      button.setAttribute("aria-label", `${square.toUpperCase()}, ${piece ? pieceName(piece) : "empty"}`);
      if (phase === "recall" && isSelected(piece, square)) button.classList.add("selected");
      if (phase === "review" && !original && (piece || result.target[square])) {
        button.classList.add(result.correct.includes(square) ? "correct" : "wrong");
      }
      const label = document.createElement("span");
      label.className = "coordinate";
      label.textContent = square.toUpperCase();
      label.setAttribute("aria-hidden", "true");
      button.append(label);
      if (piece) { button.append(pieceElement(piece)); makeDraggable(button, piece, square); }
      button.addEventListener("click", () => {
        if (phase !== "recall" || busy) return;
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
  $("tray").classList.toggle("all-pieces", round?.palette === "all");
  if (phase === "recall") {
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
  $("start").disabled = busy || ["study", "recall"].includes(phase);
  for (const key of ["mode", "size", "palette", "count", "seconds"]) $(key).disabled = busy || ["study", "recall"].includes(phase);
  $("next").disabled = busy;
  if (focusedSquare) board.querySelector(`[data-square="${focusedSquare}"]`)?.focus();
  else if (focusedPiece) $("tray").querySelector(`[data-piece="${focusedPiece}"]`)?.focus();
}
function place(choice, square) {
  const {piece, from: previous} = choice;
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
function hide() {
  if (phase !== "study") return;
  cancelAnimationFrame(animation);
  phase = "recall";
  // Keep no reference-position rendering in the DOM during recall.
  round.position = null;
  $("timer-bar").style.width = "0%";
  $("phase").textContent = "02 / REBUILD";
  $("instruction").textContent = "Rebuild the position";
  showStatus("Drag a piece onto the board, or select it and tap a square. There’s no time limit.");
  render();
  $("tray").querySelector("button")?.focus();
}
$("settings").addEventListener("submit", start);
$("next").addEventListener("click", start);
$("hide").addEventListener("click", hide);
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
$("clear").addEventListener("click", () => { if (!busy) { placement = {}; selected = null; render(); showStatus("Board cleared. Rebuild the position from memory."); } });
$("check").addEventListener("click", async () => {
  if (busy || phase !== "recall") return;
  busy = true; render();
  try {
    result = await api("check", {id: round.id, placement});
    phase = "review"; selected = null; original = false;
    progress(result.progress);
    $("phase").textContent = "03 / REVIEW";
    $("instruction").textContent = result.perfect ? "All pieces correct" : "Review your answer";
    showStatus(`${result.correct.length} of ${result.total} pieces correct.${result.extra.length ? ` ${result.extra.length} extra ${result.extra.length === 1 ? "piece" : "pieces"}.` : ""}${result.advanced ? ` Next board: ${result.progress.size} × ${result.progress.size}.` : result.perfect ? "" : " Compare your board with the original."}`);
    $("size").value = result.progress.size;
    $("compare").textContent = "Show original";
    saveSettings();
  } catch (error) { showStatus(`${error.message} Your answer is still here. You can try checking again.`, true); }
  finally { busy = false; render(); if (phase === "review") $("next").focus(); }
});
$("compare").addEventListener("click", () => {
  original = !original;
  $("compare").textContent = original ? "Show my answer" : "Show original";
  $("instruction").textContent = original ? "The original position." : "Your remembered position.";
  render();
});
function settingsChanged() {
  const max = Math.min(32, Number($("size").value) ** 2);
  $("count").max = max;
  if (Number($("count").value) > max) $("count").value = max;
  $("mode-help").textContent = $("mode").value === "progressive" ? "The board grows after three perfect rounds in a row." : "The board stays at the selected size.";
  saveSettings();
  if (phase === "ready") render();
}
$("settings").addEventListener("change", settingsChanged);
// A background tab must not gain extra study time when it becomes visible again.
document.addEventListener("visibilitychange", () => { if (phase === "study" && performance.now() >= deadline) hide(); });
settingsChanged();
render();

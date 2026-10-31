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
const isMark = (piece) => ["x", "xw", "xb"].includes(piece);
function pieceElement(piece) {
  if (isMark(piece)) {
    const mark = document.createElement("span");
    mark.className = `threat-mark${piece === "xb" ? " black-threat" : ""}`;
    mark.textContent = piece === "xb" ? "○" : "×";
    mark.setAttribute("aria-hidden", "true");
    return mark;
  }
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

// Keep coordinates outside the playing squares, including on smaller memory boards.
function renderCoordinates(board, size) {
  const frame = board.parentElement;
  if (frame.dataset.coordinateSize === String(size)) return;
  frame.dataset.coordinateSize = size;
  frame.style.setProperty("--size", size);
  frame.querySelectorAll(".board-ranks, .board-files").forEach((node) => node.remove());
  for (const axis of ["ranks", "files"]) {
    const labels = document.createElement("div");
    labels.className = `board-${axis}`;
    labels.setAttribute("aria-hidden", "true");
    for (let i = 0; i < size; i++) {
      const label = document.createElement("span");
      label.textContent = axis === "ranks" ? size - i : String.fromCharCode(97 + i);
      labels.append(label);
    }
    frame.append(labels);
  }
}

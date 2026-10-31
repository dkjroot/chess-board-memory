/* Optional: npm install --no-save playwright, start the server, then run this file. */
const {chromium} = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const artifactDir = process.env.TEST_ARTIFACT_DIR || path.join(__dirname, "artifacts");

// Independent geometric oracle for the end-to-end attack questions.
function expectedMarks(round) {
  const {position, size, question} = round;
  if (["pieces_all", "pieces_both"].includes(question.kind)) {
    const white = expectedMarks({...round, question: {kind: "pieces_side", context: {attacker_colour: "White"}}});
    const black = expectedMarks({...round, question: {kind: "pieces_side", context: {attacker_colour: "Black"}}});
    return {...Object.fromEntries(Object.keys(white).map((sq) => [sq, question.kind === "pieces_both" ? "xw" : "x"])),
      ...Object.fromEntries(Object.keys(black).map((sq) => [sq, question.kind === "pieces_both" ? "xb" : "x"]))};
  }
  const colour = question.context.attacker_colour === "Black" ? "b" : "w";
  const kinds = {K: "king", Q: "queen", R: "rook", B: "bishop", N: "knight", P: "pawn"};
  const kind = question.kind.endsWith("_piece") ? Object.keys(kinds).find((key) => question.context.piece === kinds[key]) : null;
  const result = new Set();
  const xy = (sq) => [sq.charCodeAt(0) - 97, Number(sq[1]) - 1];
  for (const [source, piece] of Object.entries(position)) {
    if (piece[0] !== colour || kind && piece[1] !== kind) continue;
    const [x, y] = xy(source);
    for (let a = 0; a < size; a++) for (let b = 0; b < size; b++) {
      const dx = a - x, dy = b - y;
      if (!dx && !dy) continue;
      const k = piece[1];
      const diagonal = Math.abs(dx) === Math.abs(dy);
      const straight = !dx || !dy;
      const reaches = k === "P" ? Math.abs(dx) === 1 && dy === (colour === "w" ? 1 : -1)
        : k === "N" ? Math.abs(dx) * Math.abs(dy) === 2
        : k === "K" ? Math.max(Math.abs(dx), Math.abs(dy)) === 1
        : k === "B" ? diagonal : k === "R" ? straight : diagonal || straight;
      if (!reaches) continue;
      if ("BRQ".includes(k)) {
        let blocked = false;
        for (let step = 1; step < Math.max(Math.abs(dx), Math.abs(dy)); step++) {
          const between = `${String.fromCharCode(97 + x + step * Math.sign(dx))}${y + step * Math.sign(dy) + 1}`;
          if (position[between]) { blocked = true; break; }
        }
        if (blocked) continue;
      }
      const square = `${String.fromCharCode(97 + a)}${b + 1}`;
      if ((!position[square] || position[square][0] !== colour) && (!question.kind.startsWith("pieces_") || position[square])) result.add(square);
    }
  }
  return Object.fromEntries([...result].map((sq) => [sq, "x"]));
}

(async () => {
  const channel = process.env.BROWSER_CHANNEL || "msedge";
  const browser = await chromium.launch({headless: true, ...(channel === "chromium" ? {} : {channel})});
  const context = await browser.newContext({viewport: {width: 1280, height: 1000}, hasTouch: true, colorScheme: "light"});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  fs.mkdirSync(artifactDir, {recursive: true});
  let activeRound;
  async function start() {
    const response = page.waitForResponse((response) => response.url().endsWith("/api/start"));
    await page.locator("#start").click();
    const round = await (await response).json();
    assert.equal(round.question, undefined);
    activeRound = round;
    await page.locator("#hide").waitFor({state: "visible"});
    return round;
  }
  async function hideRound() {
    const response = page.waitForResponse((response) => response.url().endsWith("/api/reveal"));
    await page.locator("#hide").click();
    activeRound.question = (await (await response).json()).question;
    await page.locator("#check").waitFor({state: "visible"});
    assert.equal(await page.locator("#instruction").textContent(), activeRound.question.prompt);
    assert.equal(await page.locator("#question-note").textContent(), activeRound.question.note);
  }
  async function check() {
    const response = page.waitForResponse((response) => response.url().endsWith("/api/check"));
    await page.locator("#check").click();
    const result = await (await response).json();
    await page.locator("#next").waitFor({state: "visible"});
    return result;
  }
  try {
    await page.goto(process.env.TEST_URL || "http://127.0.0.1:8765");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    assert.equal(await page.locator("#theme-toggle").textContent(), "Dark mode");
    // Palette and appearance are independent, persist, and work on both pages.
    const paletteNames = ["classic", "purple", "bw", "blue", "metal", "glass", "wood"];
    assert.deepEqual(await page.locator("#theme-palette option").evaluateAll(options => options.map(o => o.value)), paletteNames);
    const pageColours = new Set();
    for (const palette of paletteNames) {
      await page.locator("#theme-palette").selectOption(palette);
      for (const appearance of ["light", "dark"]) {
        if (await page.locator("html").getAttribute("data-theme") !== appearance) await page.locator("#theme-toggle").click();
        await page.reload();
        assert.equal(await page.locator("html").getAttribute("data-theme"), appearance);
        assert.equal(await page.locator("#theme-palette").inputValue(), palette);
        const colours = await page.evaluate(() => {
          const root = getComputedStyle(document.documentElement);
          return ["--paper", "--light", "--dark"].map(key => root.getPropertyValue(key).trim()).join("/");
        });
        assert.ok(!pageColours.has(colours), `Distinct colours for ${palette} ${appearance}`);
        pageColours.add(colours);
        await page.getByRole("link", {name:"Openings", exact:true}).click();
        assert.equal(await page.locator("html").getAttribute("data-theme"), appearance);
        assert.equal(await page.locator("#theme-palette").inputValue(), palette);
        assert.equal(await page.locator("#board .piece").count(), 32);
        await page.screenshot({path:path.join(artifactDir, `theme-${palette}-${appearance}.png`), fullPage:true});
        await page.goto(process.env.TEST_URL || "http://127.0.0.1:8765");
      }
    }
    await page.locator("#theme-palette").selectOption("classic");
    await page.locator("#theme-toggle").click();
    assert.equal(await page.locator("h1").textContent(), "Chess Board Memory");
    assert.equal(await page.locator(".intro, footer").count(), 0);
    await page.screenshot({path: path.join(artifactDir, "desktop.png"), fullPage: true});
    await page.locator("#theme-toggle").click();
    assert.equal(await page.locator("#theme-toggle").textContent(), "Light mode");
    assert.equal(await page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor), "rgb(20, 27, 24)");
    await page.reload();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(await page.locator("#theme-toggle").textContent(), "Light mode");
    await page.screenshot({path: path.join(artifactDir, "desktop-dark.png"), fullPage: true});
    assert.equal(await page.locator(".square").count(), 9);
    for (let attempt = 0; attempt < 3; attempt++) {
      const round = await start();
      assert.equal(await page.locator("#board .piece").count(), 3);
      assert.equal(await page.locator("#board svg.piece").count(), 3);
      if (attempt === 0) {
        await page.screenshot({path: path.join(artifactDir, "pieces-dark.png"), fullPage: true});
        await page.locator("#theme-toggle").click();
        assert.equal(await page.locator("#board svg.piece").count(), 3);
      }
      await hideRound();
      assert.equal(await page.locator("#board .piece").count(), 0);
      const entries = Object.entries(round.position);
      // Desktop drag/drop, keyboard selection/placement, then click placement.
      const [square, piece] = entries[0];
      await page.locator(`#tray [data-piece="${piece}"]`).dragTo(page.locator(`[data-square="${square}"]`));
      const [sq2, p2] = entries[1];
      await page.locator(`#tray [data-piece="${p2}"]`).focus();
      await page.keyboard.press("Enter");
      await page.locator(`[data-square="${sq2}"]`).focus();
      await page.keyboard.press("Space");
      const [sq3, p3] = entries[2];
      await page.locator(`#tray [data-piece="${p3}"]`).click();
      await page.locator(`[data-square="${sq3}"]`).click();
      if (attempt === 0) {
        // Swap occupied squares in both directions, then return and replace a piece.
        for (let i = 0; i < 2; i++) {
          await page.locator(`[data-square="${square}"]`).click();
          await page.locator(`[data-square="${sq2}"]`).click();
        }
        await page.locator(`[data-square="${sq3}"]`).click();
        await page.locator("#remove").click();
        assert.equal(await page.locator("#board .piece").count(), 2);
        await page.locator(`#tray [data-piece="${p3}"]`).click();
        await page.locator(`[data-square="${sq3}"]`).click();
      }
      const result = await check();
      assert.equal(result.perfect, true);
      assert.equal(result.progress.rounds, attempt + 1);
      if (attempt === 2) assert.equal(result.progress.size, 4);
      assert.equal(await page.locator(".square.correct").count(), 3);
      await page.locator("#compare").click();
      assert.equal(await page.locator("#instruction").textContent(), "The original position.");
      await page.locator("#compare").click();
    }
    const round = await start();
    assert.equal(round.size, 4);
    await hideRound();
    const [square, piece] = Object.entries(round.position)[0];
    await page.locator(`#tray [data-piece="${piece}"]`).click();
    await page.locator(`[data-square="${square}"]`).click();
    await page.locator(`[data-square="${square}"]`).click();
    await page.keyboard.press("Delete");
    assert.equal(await page.locator("#board .piece").count(), 0);
    const partial = await check();
    assert.equal(partial.perfect, false);
    assert.equal(partial.correct.length, 0);
    assert.equal(partial.progress.streak, 0);
    assert.equal(await page.locator(".square.wrong").count(), 3);
    // Automatic hiding and an incomplete answer.
    await page.locator("#seconds").fill("2");
    await start();
    await page.locator("#check").waitFor({state: "visible", timeout: 5000});
    assert.equal(await page.locator("#board .piece").count(), 0);
    await check();
    // Network failure leaves the remembered answer editable and checkable.
    await start();
    await hideRound();
    await page.route("**/api/check", (route) => route.abort());
    await page.locator("#check").click();
    await page.waitForFunction(() => document.querySelector("#status").classList.contains("error"));
    assert.equal(await page.locator("#check").isEnabled(), true);
    await page.unroute("**/api/check");
    await check();
    // Mobile tap interaction, full-size board, no horizontal overflow.
    await page.setViewportSize({width: 390, height: 844});
    await page.locator("#mode").selectOption("memory_fixed");
    await page.locator("#size").selectOption("8");
    await page.locator("#count").fill("32");
    await page.locator("#seconds").fill("60");
    const large = await start();
    assert.equal(large.size, 8);
    assert.equal(await page.locator(".square").count(), 64);
    await page.screenshot({path: path.join(artifactDir, "mobile.png"), fullPage: true});
    assert.equal(await page.locator("#board svg.white-piece").count(), 16);
    assert.equal(await page.locator("#board svg.black-piece").count(), 16);
    await page.locator("#theme-toggle").click();
    await page.screenshot({path: path.join(artifactDir, "mobile-dark.png"), fullPage: true});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const cells = await page.locator(".square").evaluateAll((squares) => squares.map((square) => {
      const rect = square.getBoundingClientRect();
      return {width: rect.width, height: rect.height};
    }));
    assert.ok(cells.every((cell) => Math.abs(cell.width - cell.height) < 1), "Every mobile board square stays square");
    await hideRound();
    const [tapSquare, tapPiece] = Object.entries(large.position)[0];
    await page.locator(`#tray [data-piece="${tapPiece}"]`).tap();
    await page.locator(`[data-square="${tapSquare}"]`).tap();
    assert.equal(await page.locator("#board .piece").count(), 1);
    await page.locator("#clear").click();
    assert.equal(await page.locator("#board .piece").count(), 0);
    await page.reload();
    assert.equal(await page.locator("#size").inputValue(), "8");
    assert.equal(await page.locator("#count").inputValue(), "32");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    // The full palette offers decoys without revealing which types were in the puzzle.
    await page.locator("#palette").selectOption("all");
    await page.locator("#size").selectOption("3");
    await page.locator("#count").fill("3");
    const full = await start();
    await hideRound();
    assert.equal(await page.locator("#tray button").count(), 12);
    assert.equal(await page.locator("#tray .white-piece").count(), 6);
    assert.equal(await page.locator("#tray .black-piece").count(), 6);
    const decoy = full.pieces.find((piece) => full.inventory[piece] === 1 && !Object.values(full.position).includes(piece));
    const empty = ["a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"].find((sq) => !full.position[sq]);
    await page.locator(`#tray [data-piece="${decoy}"]`).dragTo(page.locator(`[data-square="${empty}"]`));
    assert.equal(await page.locator(`#tray [data-piece="${decoy}"]`).isDisabled(), true);
    assert.equal(await page.locator("#tray button").count(), 12);
    const traySize = await page.locator(`#tray [data-piece="${decoy}"] svg`).boundingBox();
    const boardSize = await page.locator(`[data-square="${empty}"] svg`).boundingBox();
    assert.ok(traySize.height < boardSize.height);
    await page.locator(`[data-square="${empty}"]`).tap();
    await page.locator("#remove").click();
    assert.equal(await page.locator(`#tray [data-piece="${decoy}"]`).isEnabled(), true);
    for (const [sq, piece] of Object.entries(full.position)) {
      await page.locator(`#tray [data-piece="${piece}"]`).tap();
      await page.locator(`[data-square="${sq}"]`).tap();
    }
    await page.locator(`#tray [data-piece="${decoy}"]`).tap();
    await page.locator(`[data-square="${empty}"]`).tap();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({path: path.join(artifactDir, "full-palette-dark.png"), fullPage: true});
    const extras = await check();
    assert.equal(extras.perfect, false);
    assert.equal(extras.correct.length, 3);
    assert.deepEqual(extras.extra, [empty]);
    assert.ok((await page.locator("#status").textContent()).includes("1 extra piece"));
    await page.reload();
    assert.equal(await page.locator("#palette").inputValue(), "all");
    await page.locator("#palette").selectOption("puzzle");
    const puzzle = await start();
    await hideRound();
    assert.equal(await page.locator("#tray button").count(), Object.keys(puzzle.inventory).length);
    await check();
    // A whole set guarantees repeated pawns/rooks, without relying on random draws.
    await page.locator("#size").selectOption("8");
    await page.locator("#count").fill("32");
    await page.locator("#palette").selectOption("all");
    const material = await start();
    await hideRound();
    const pawns = page.locator('#tray [data-piece="wP"]');
    for (const file of "abcdefgh") {
      await pawns.tap();
      await page.locator(`[data-square="${file}1"]`).tap();
    }
    assert.equal(await pawns.isDisabled(), true);
    assert.equal(await pawns.locator(".remaining").textContent(), "×0");
    assert.equal(await page.locator("#board .white-piece").count(), 8);
    // Moving one pawn must leave all seven other pawns alone.
    await page.locator('[data-square="a1"]').dragTo(page.locator('[data-square="a2"]'));
    assert.equal(await page.locator("#board .white-piece").count(), 8);
    assert.equal(await page.locator('[data-square="a1"] .piece').count(), 0);
    await page.locator('[data-square="a2"]').tap();
    await page.locator("#remove").click();
    assert.equal(await page.locator("#board .white-piece").count(), 7);
    assert.equal(await pawns.locator(".remaining").textContent(), "×1");
    for (const sq of ["a1", "a2"]) {
      await page.locator('#tray [data-piece="wR"]').tap();
      await page.locator(`[data-square="${sq}"]`).tap();
    }
    assert.equal(await page.locator('#tray [data-piece="wR"]').isDisabled(), true);
    await page.locator('[data-square="a2"]').tap();
    await page.locator('[data-square="b1"]').tap();
    assert.equal(await page.locator("#board .white-piece").count(), 9);
    assert.equal(await pawns.locator(".remaining").textContent(), "×1");
    await page.screenshot({path: path.join(artifactDir, "repeated-pieces.png"), fullPage: true});
    await page.locator("#clear").click();
    assert.equal(await pawns.locator(".remaining").textContent(), "×8");
    for (const [sq, piece] of Object.entries(material.position)) {
      await page.locator(`#tray [data-piece="${piece}"]`).tap();
      await page.locator(`[data-square="${sq}"]`).tap();
    }
    assert.equal(await page.locator("#board .piece").count(), 32);
    assert.equal((await check()).perfect, true);
    // All six threat templates: a complete set exercises both attacking colours.
    await page.locator("#size").selectOption("6");
    await page.locator("#count").fill("32");
    await page.locator("#mode").selectOption("threats_fixed");
    const seen = new Set();
    for (let i = 0; i < 6; i++) {
      const threat = await start();
      assert.equal(await page.locator("#board .piece").count(), 32);
      assert.equal(await page.locator("#question-prompt").textContent(), "");
      assert.equal(await page.locator("#question-note").textContent(), "");
      await hideRound();
      assert.equal(await page.locator("#board .piece").count(), 0);
      assert.equal(await page.locator("#tray .piece").count(), 0);
      seen.add(threat.question.kind);
      assert.equal(await page.locator("#instruction").textContent(), threat.question.prompt);
      const answers = expectedMarks(threat);
      await page.locator("#mark-tool").dragTo(page.locator('[data-square="a1"]'));
      assert.equal(await page.locator("#board .threat-mark").count(), 1);
      await page.locator('[data-square="a1"]').focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("#board .threat-mark").count(), 0);
      for (const [sq, marker] of Object.entries(answers)) {
        await page.locator(`#tray [data-piece="${marker}"]`).dragTo(page.locator(`[data-square="${sq}"]`));
      }
      if (threat.question.kind === "pieces_both") {
        assert.equal(await page.locator("#tray .mark-tool").count(), 2);
        await page.screenshot({path: path.join(artifactDir, "two-colour-threats.png"), fullPage: true});
      }
      assert.equal(await page.locator("#board .piece").count(), 0);
      if (i === 0) await page.screenshot({path: path.join(artifactDir, "threats-recall.png"), fullPage: true});
      const scored = await check();
      assert.equal(scored.perfect, true);
      assert.equal(scored.total, Object.keys(answers).length);
      await page.locator("#compare").click();
      assert.equal(await page.locator("#board .piece").count(), 32);
      assert.equal(await page.locator("#board .threat-mark").count(), Object.keys(answers).length);
      await page.locator("#compare").click();
      assert.equal(await page.locator("#board .piece").count(), 0);
    }
    assert.equal(seen.size, 6);
    // Mixed practice uses the same question catalogue and answer UI.
    for (const mode of ["threats_progressive", "random_fixed", "random_progressive"]) {
      await page.locator("#size").selectOption("3");
      await page.locator("#count").fill("3");
      await page.locator("#mode").selectOption(mode);
      const mixedSeen = new Set();
      for (let i = 0; i < (mode === "random_fixed" ? 7 : 3); i++) {
        const mixed = await start();
        await hideRound();
        mixedSeen.add(mixed.question.kind);
        assert.equal(await page.locator("#board .piece").count(), 0);
        if (mixed.question.answer_kind === "position") {
          for (const [sq, piece] of Object.entries(mixed.position)) {
            await page.locator(`#tray [data-piece="${piece}"]`).tap();
            await page.locator(`[data-square="${sq}"]`).tap();
          }
        } else {
          for (const [sq, marker] of Object.entries(expectedMarks(mixed))) {
            await page.locator(`#tray [data-piece="${marker}"]`).tap();
            await page.locator(`[data-square="${sq}"]`).tap();
          }
        }
        const scored = await check();
        assert.equal(scored.perfect, true);
        if (i === 2 && mode.endsWith("progressive")) assert.equal(scored.progress.size, 4);
      }
      if (mode === "random_fixed") {
        // Exhausted types may be skipped; deterministic bag coverage is tested in Python.
        assert.ok(mixedSeen.has("memory"));
        assert.ok([...mixedSeen].some((kind) => kind !== "memory"));
      }
    }
    const darkContext = await browser.newContext({colorScheme: "dark"});
    const darkPage = await darkContext.newPage();
    await darkPage.goto(process.env.TEST_URL || "http://127.0.0.1:8765");
    assert.equal(await darkPage.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(await darkPage.locator("#theme-toggle").textContent(), "Light mode");
    await darkPage.locator("#theme-toggle").click();
    await darkPage.reload();
    assert.equal(await darkPage.locator("html").getAttribute("data-theme"), "light");
    assert.equal(await darkPage.locator("#theme-toggle").textContent(), "Dark mode");
    await darkPage.locator("#theme-palette").selectOption("glass");
    assert.equal(await darkPage.locator("body").evaluate(body => getComputedStyle(body).backgroundColor), "rgb(239, 249, 250)");
    await darkPage.evaluate(() => localStorage.setItem("chess-memory-palette", "unknown"));
    await darkPage.reload();
    assert.equal(await darkPage.locator("#theme-palette").inputValue(), "classic");
    await darkPage.evaluate(() => localStorage.setItem("chess-memory-settings", JSON.stringify({mode: "fixed", size: 4, count: 5, seconds: 2, palette: "all"})));
    await darkPage.reload();
    assert.equal(await darkPage.locator("#mode").inputValue(), "memory_fixed");
    assert.equal(await darkPage.locator("#size").inputValue(), "4");
    await darkPage.locator("#mode").selectOption("threats_fixed");
    await darkPage.route("**/api/reveal", (route) => route.abort());
    await darkPage.locator("#start").click();
    await darkPage.locator("#reveal").waitFor({state: "visible", timeout: 5000});
    assert.equal(await darkPage.locator("#board .piece").count(), 0);
    assert.equal(await darkPage.locator("#instruction").textContent(), "Position hidden");
    await darkPage.unroute("**/api/reveal");
    await darkPage.locator("#reveal").click();
    await darkPage.locator("#check").waitFor({state: "visible", timeout: 5000});
    assert.equal(await darkPage.locator("#board .piece").count(), 0);
    assert.equal(await darkPage.locator("#mark-tool").count(), 1);
    await darkContext.close();
    // fetch's expected failure is recorded by the browser, not an app exception.
    assert.deepEqual(errors.filter((error) => !error.includes("net::ERR_FAILED")), []);
    console.log("Browser checks passed: memory, repeated material, threats, hidden-board recall, six practices, shuffled bags, scoring, progression, review, drag/tap/keyboard, timer, retry, settings migration, themes and mobile layout.");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

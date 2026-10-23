/* Optional: npm install --no-save playwright, start the server, then run this file. */
const {chromium} = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const artifactDir = process.env.TEST_ARTIFACT_DIR || path.join(__dirname, "artifacts");

(async () => {
  const channel = process.env.BROWSER_CHANNEL || "msedge";
  const browser = await chromium.launch({headless: true, ...(channel === "chromium" ? {} : {channel})});
  const context = await browser.newContext({viewport: {width: 1280, height: 1000}, hasTouch: true, colorScheme: "light"});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  fs.mkdirSync(artifactDir, {recursive: true});
  async function start() {
    const response = page.waitForResponse((response) => response.url().endsWith("/api/start"));
    await page.locator("#start").click();
    const round = await (await response).json();
    await page.locator("#hide").waitFor({state: "visible"});
    return round;
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
      await page.locator("#hide").click();
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
    await page.locator("#hide").click();
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
    await page.locator("#hide").click();
    await page.route("**/api/check", (route) => route.abort());
    await page.locator("#check").click();
    await page.waitForFunction(() => document.querySelector("#status").classList.contains("error"));
    assert.equal(await page.locator("#check").isEnabled(), true);
    await page.unroute("**/api/check");
    await check();
    // Mobile tap interaction, full-size board, no horizontal overflow.
    await page.setViewportSize({width: 390, height: 844});
    await page.locator("#mode").selectOption("fixed");
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
    await page.locator("#hide").click();
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
    await page.locator("#hide").click();
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
    await page.locator("#hide").click();
    assert.equal(await page.locator("#tray button").count(), Object.keys(puzzle.inventory).length);
    await check();
    // A whole set guarantees repeated pawns/rooks, without relying on random draws.
    await page.locator("#size").selectOption("8");
    await page.locator("#count").fill("32");
    await page.locator("#palette").selectOption("all");
    const material = await start();
    await page.locator("#hide").click();
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
    const darkContext = await browser.newContext({colorScheme: "dark"});
    const darkPage = await darkContext.newPage();
    await darkPage.goto(process.env.TEST_URL || "http://127.0.0.1:8765");
    assert.equal(await darkPage.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(await darkPage.locator("#theme-toggle").textContent(), "Light mode");
    await darkPage.locator("#theme-toggle").click();
    await darkPage.reload();
    assert.equal(await darkPage.locator("html").getAttribute("data-theme"), "light");
    assert.equal(await darkPage.locator("#theme-toggle").textContent(), "Dark mode");
    await darkContext.close();
    // fetch's expected failure is recorded by the browser, not an app exception.
    assert.deepEqual(errors.filter((error) => !error.includes("net::ERR_FAILED")), []);
    console.log("Browser checks passed: drag/drop, keyboard, click placement, recall, scoring, progression, review, deletion, timer, retry, settings, mobile layout.");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

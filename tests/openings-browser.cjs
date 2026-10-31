const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {LONDON_LINES, QUEENS_GAMBIT_LINES} = require('../static/opening-practice.js');
(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.TEST_BROWSER_EXECUTABLE ? {executablePath:process.env.TEST_BROWSER_EXECUTABLE} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:900},hasTouch:true});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const base = process.env.TEST_URL || 'http://127.0.0.1:8765';
    const artifacts = process.env.TEST_ARTIFACT_DIR || path.join(__dirname,'artifacts');
    fs.mkdirSync(artifacts,{recursive:true});
    await page.goto(base);
    await page.evaluate(() => localStorage.setItem('chess-openings-preferences',JSON.stringify({opening:'london',mode:'repeat'})));
    await page.getByRole('link',{name:'Openings',exact:true}).click();
    const square = sq => page.locator(`[data-square="${sq}"]`);
    const checkbox = id => page.locator(`[data-choice="${id}"]`);
    const title = id => page.locator(`[data-select="${id}"]`);
    const mode = id => page.locator(`[data-mode="${id}"]`);
    const move = async (from,to) => {await square(from).click();await square(to).click();};
    const reply = () => page.waitForFunction(() => document.querySelector('#phase').textContent !== "BLACK'S REPLY");
    const prefix = async line => {for(let i=0;i<4;i+=2){await move(...line[i]);await reply();}};
    const finish = async (line, start=0, depth=3) => {for(let i=start;i<depth*2;i+=2){await move(...line[i]);await reply();}};
    const reset = () => page.waitForFunction(() => !document.querySelector('.mistake-square'));
    const save = async file => {
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      return page.screenshot({path:path.join(artifacts,file),fullPage:false,animations:'disabled'});
    };
    assert.equal(await page.locator('.square').count(),64,JSON.stringify(errors));
    assert.equal(await page.locator('#board .piece').count(),32);
    assert.equal(await page.locator('#opening-tree input').count(),4);
    assert.equal(await checkbox('london-d5').count(),0,'Single-line openings have no child option');
    // Wrong moves remain on the attempted square briefly and select Repeat 1.
    await move('e2','e4');
    assert.equal(await square('e4').locator('.piece').count(),1);
    assert.equal(await square('e2').locator('.piece').count(),0);
    assert.equal(await square('e4').getAttribute('aria-label'),'E4, White pawn, incorrect move');
    assert.match(await page.locator('#status').textContent(),/Restarting/);
    assert.equal(await mode('repeat-one').getAttribute('aria-pressed'),'true');
    assert.ok(await mode('repeat-one').evaluate(button => button.classList.contains('attention')));
    await save('incorrect-move.png');
    await move('d2','d4'); // Input is ignored while the wrong move is being shown.
    assert.equal(await square('d2').locator('.piece').count(),1);
    await reset();
    assert.equal(await page.locator('.hint-source').count(),1);
    await move('e2','e4'); await reset();
    assert.equal(await square('d4').locator('.ghost-piece').count(),1);
    await square('d2').focus(); await page.keyboard.press('Enter');
    await square('d4').focus(); await page.keyboard.press('Enter'); await reply();
    await square('c1').dragTo(square('f4')); await reply();
    await move('e2','e3'); await reply();
    assert.match(await page.locator('#status').textContent(),/Well done/);
    assert.ok(await page.locator('#status').evaluate(node => node.classList.contains('success')));
    assert.ok(await page.locator('#again').evaluate(node => node.classList.contains('primary')));
    assert.equal(await page.locator('#deeper').isVisible(),true);
    await save('line-complete.png');
    await page.locator('#deeper').click();
    assert.equal(await page.locator('.hint-source').count(),0);
    await move('d2','d4');
    await page.locator('#depth').selectOption('8');
    await page.waitForTimeout(550);
    assert.equal(await square('d7').locator('.piece').count(),1,'Depth change cancels pending reply');
    await finish(LONDON_LINES[0].moves,0,8);
    assert.equal(await square('g1').getAttribute('aria-label'),'G1, White king');
    assert.equal(await square('f1').getAttribute('aria-label'),'F1, White rook');
    assert.equal(await square('g8').getAttribute('aria-label'),'G8, Black king');
    await page.locator('#again').click();
    // One global limit survives opening changes, all modes and reloads.
    assert.equal(await page.locator('.page-nav #depth').count(),1);
    assert.equal(await page.locator('#depth option:last-child').textContent(),'Up to 8');
    await mode('shuffle').click();
    assert.equal(await page.locator('#depth').inputValue(),'8');
    await title('qg-accepted').click();
    for (const id of ['repeat','repeat-one','shuffle']) {
      await mode(id).click();
      assert.equal(await page.locator('#depth').inputValue(),'8');
      assert.equal(await page.locator('#depth option:last-child').getAttribute('value'),'8');
    }
    await finish(QUEENS_GAMBIT_LINES[0].moves,0,5);
    assert.equal(await page.locator('#phase').textContent(),'LINE COMPLETE');
    assert.equal(await page.locator('#badge').textContent(),'5 / 5');
    assert.equal(await page.locator('#depth').inputValue(),'8','Short line completion keeps the shared limit');
    await page.reload();
    assert.equal(await page.locator('#depth').inputValue(),'8');
    await title('london').click();
    await finish(LONDON_LINES[0].moves,0,8);
    assert.equal(await page.locator('#badge').textContent(),'8 / 8');
    await page.locator('#again').click();
    // Only playlist changes alter the available ceiling; re-enabling doesn't raise the chosen depth.
    await checkbox('london').uncheck();
    assert.equal(await page.locator('#depth').inputValue(),'5');
    assert.equal(await page.locator('#depth option:last-child').getAttribute('value'),'5');
    await checkbox('london').check();
    assert.equal(await page.locator('#depth').inputValue(),'5');
    assert.equal(await page.locator('#depth option:last-child').getAttribute('value'),'8');
    await page.locator('#depth').selectOption('8');
    await title('london').click();
    await mode('repeat-one').click();
    await page.locator('#theme-toggle').click();
    for(const viewport of [{width:320,height:568},{width:768,height:600},{width:1280,height:720},{width:844,height:390}]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0,0));
      const board = await page.locator('#board').boundingBox();
      assert.ok(board.y>=0 && board.y+board.height<=viewport.height,`Board fits ${JSON.stringify(viewport)}: ${JSON.stringify(board)}`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth));
      const sizes = await page.locator('.square').evaluateAll(cells => cells.map(c => {const r=c.getBoundingClientRect();return Math.abs(r.width-r.height);}));
      assert.ok(sizes.every(d=>d<1));
      assert.equal((await page.locator('.board-files span').allTextContents()).join(''),'abcdefgh');
      await save(`openings-${viewport.width}x${viewport.height}.png`);
    }
    await page.setViewportSize({width:1280,height:900});
    // Clicking a name selects without changing the mode or playlist.
    await title('queens-gambit').click();
    assert.equal(await mode('repeat-one').getAttribute('aria-pressed'),'true');
    assert.equal(await checkbox('queens-gambit').isChecked(),true);
    await mode('repeat').click();
    await page.locator('#depth').selectOption('3');
    const accepted = QUEENS_GAMBIT_LINES[0].moves, declined = QUEENS_GAMBIT_LINES[1].moves;
    await prefix(accepted);
    await move('b1','c3');
    await reset();
    assert.equal(await mode('repeat-one').getAttribute('aria-pressed'),'true');
    await finish(accepted);
    await page.locator('#again').click();
    await prefix(accepted);
    assert.equal(await square('c4').getAttribute('aria-label'),'C4, Black pawn','Repeat 1 stays Accepted after success');
    const history = await page.locator('#moves').textContent();
    await mode('repeat').click();
    assert.equal(await page.locator('#moves').textContent(),history,'Changing modes keeps the current board');
    await finish(accepted,4);
    await page.locator('#again').click();
    await prefix(declined);
    assert.equal(await square('e6').getAttribute('aria-label'),'E6, Black pawn','Repeat cycles Black responses');
    await move('g1','f3'); await reset();
    await finish(declined);
    await page.reload();
    assert.equal(await mode('repeat-one').getAttribute('aria-pressed'),'true');
    await prefix(declined);
    assert.equal(await square('e6').getAttribute('aria-label'),'E6, Black pawn','Reload remembers the exact pinned variation');
    await title('qg-accepted').click();
    await move('d2','d4');
    await mode('shuffle').click(); // A pending Black reply survives a mode change.
    await reply();
    assert.equal(await square('d5').getAttribute('aria-label'),'D5, Black pawn');
    assert.match(await page.locator('#moves').textContent(),/1\. d4 d5/);
    // Partial checks, clearing every variation, and restoring parent checkboxes.
    await checkbox('qg-accepted').uncheck();
    assert.equal(await checkbox('queens-gambit').evaluate(input=>input.indeterminate),true);
    await checkbox('qg-declined').uncheck();
    assert.equal(await checkbox('queens-gambit').isChecked(),false);
    await page.reload();
    assert.equal(await checkbox('queens-gambit').isChecked(),false);
    assert.equal(await checkbox('qg-accepted').isChecked(),false);
    await checkbox('qg-accepted').check();
    assert.equal(await checkbox('queens-gambit').isChecked(),true);
    assert.equal(await checkbox('queens-gambit').evaluate(input=>input.indeterminate),true);
    await checkbox('queens-gambit').click(); // A mixed parent selects all.
    assert.equal(await checkbox('qg-declined').isChecked(),true);
    await checkbox('london').uncheck();
    await mode('shuffle').click();
    await title('london').click();
    assert.equal(await checkbox('london').isChecked(),false,'Names do not change checkboxes');
    assert.equal(await page.locator('#instruction').textContent(),'London System');
    assert.equal(await mode('shuffle').getAttribute('aria-pressed'),'true');
    await page.locator('#depth').selectOption('1');
    await move('d2','d4'); await reply(); await page.locator('#again').click();
    assert.equal(await page.locator('#instruction').textContent(),"Queen's Gambit",'Shuffle returns to the checked list');
    // Explicit variation selection in every mode.
    for(const id of ['shuffle','repeat','repeat-one']) {
      await mode(id).click(); await title('qg-declined').click();
      await page.locator('#depth').selectOption('3');
      await title('qg-declined').click();
      await prefix(declined);
      assert.equal(await square('e6').getAttribute('aria-label'),'E6, Black pawn');
      assert.equal(await mode(id).getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('[data-mode][aria-pressed="true"]').count(),1);
    }
    // An unchecked variation may be played now, but cannot leak into future shuffles.
    await checkbox('qg-accepted').uncheck();
    await title('qg-accepted').click();
    await mode('shuffle').click();
    await finish(accepted);
    await page.locator('#again').click();
    await prefix(declined);
    assert.equal(await square('e6').getAttribute('aria-label'),'E6, Black pawn');
    await finish(declined,4);
    await page.locator('#again').click();
    await prefix(declined);
    assert.equal(await square('e6').getAttribute('aria-label'),'E6, Black pawn','Unchecked variation stays out of subsequent runs');
    // Empty playlists persist, and a name can still be played without checking it.
    await checkbox('queens-gambit').uncheck();
    assert.match(await page.locator('#status').textContent(),/Tick an opening/);
    assert.equal(await page.locator('.playback-modes button:disabled').count(),3);
    await page.reload();
    assert.equal(await page.locator('#opening-tree input:checked').count(),0);
    await title('qg-declined').click();
    await mode('repeat-one').click();
    assert.equal(await checkbox('qg-declined').isChecked(),false);
    await prefix(declined);
    assert.equal(await square('e6').getAttribute('aria-label'),'E6, Black pawn');
    // The library grows inside its own scrollbar rather than stretching the layout.
    await page.evaluate(() => {
      const tree=document.querySelector('#opening-tree'), template=tree.firstElementChild;
      for(let i=0;i<35;i++) tree.append(template.cloneNode(true));
    });
    const scrolling=await page.locator('#opening-tree').evaluate(tree=>{tree.scrollTop=tree.scrollHeight;return {height:tree.clientHeight,scrollHeight:tree.scrollHeight,top:tree.scrollTop};});
    assert.ok(scrolling.scrollHeight>scrolling.height && scrolling.top>0);
    assert.ok(scrolling.height<=440);
    await save('scrolling-playlist.png');
    await page.reload();
    // Reduced motion keeps a static error border, and selecting a name cancels it.
    await page.emulateMedia({reducedMotion:'reduce'});
    await title('london').click();
    await move('e2','e4');
    assert.equal(await square('e4').evaluate(node=>getComputedStyle(node,'::after').animationName),'none');
    await title('qg-declined').click();
    assert.equal(await page.locator('.mistake-square').count(),0);
    await prefix(declined);
    assert.equal(await square('e6').getAttribute('aria-label'),'E6, Black pawn');
    await page.getByRole('link',{name:'Memory games',exact:true}).click();
    await page.locator('#start').click(); await page.locator('#hide').waitFor({state:'visible'});
    assert.ok(await page.locator('#board .piece').count()>0);
    assert.deepEqual(errors,[]);
    console.log('Opening browser checks passed: hierarchy, name selection, empty playlists, all three modes, pinning, persistence, error animation, success emphasis, hints, castling, keyboard/drag, responsive layout, scrolling and memory regression.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

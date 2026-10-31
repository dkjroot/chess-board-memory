# chess-board-memory

An app to work on your visualisation and memory of the chessboard.

The idea is pretty simple. You get a quick look at some pieces on a board, then
have to put them back where they were. Start on a 3 × 3 board and work your way up
as you get the hang of it.

## Free to use. Please help keep it that way.

I develop this project to be freely available to everyone, supported, if at all,
by voluntary contributions. I do not want other people to profit from my work
by selling copies, putting it behind a paywall, or building a paid application
or hosted service around it. I ask you to respect that intention: please keep
this work freely available, credit its origins, and direct people to
[my official GitHub repository](https://github.com/dkjroot/chess-board-memory) for the software.

If you want to help fund my development, please contribute **directly to me**
through [Buy Me a Coffee](https://buymeacoffee.com/dkjroot). Paying a distributor
or hosting provider does not fund my work unless I explicitly say otherwise.
There is no obligation to contribute.

**This is a personal request, not an additional license restriction.** The
[GNU General Public License v3.0](LICENSE) permits commercial use and
redistribution, including forks, subject to its terms. Those legal permissions
remain unchanged by this request. See [licensing details](LICENSING.md) and
[third-party credits](THIRD_PARTY_NOTICES.txt).

**[Support my work on Buy Me a Coffee](https://buymeacoffee.com/dkjroot)**

## Getting it running

You'll need **Python 3.10 or newer** and a web browser. That's it. There are no
extra packages to install, and you don't need an account. Once you've downloaded
it, the app runs on your own computer without an internet connection.

Download and extract the code from the
[official repository](https://github.com/dkjroot/chess-board-memory). Open a
terminal in the folder containing `app.py`, then run:

**Windows (PowerShell)**

```powershell
py -3 app.py
```

**Linux**

```bash
python3 app.py
```

Then open **[http://127.0.0.1:8765](http://127.0.0.1:8765)** in your browser.
Leave the terminal open while you're using the app. When you're finished,
press Ctrl+C in the terminal to stop it.

## Test your chess memory

1. Choose your board size, how many pieces you want, and how long you want to look
   at them. The defaults are three pieces on a 3 × 3 board, shown for eight seconds.
2. Click **Start a round** and have a look at where everything is. The pieces
   disappear when the time runs out. If you're ready sooner, you can hide them
   yourself.
3. Answer the question from memory. In a memory round, put the pieces back where
   you remember them. Drag them from the tray, or select a piece and click or tap
   its square. In a threats round, mark the threats with red Xs instead.
   There's no time limit for this part.
4. Click **Check my board** or **Check my marks**. You can check an unfinished answer too. A tick means
   you got that square right; a cross means something was wrong or missing.
   **Show original** lets you compare a memory answer with the position you saw.
   For threats, **Show correct threats** brings back the position with the right
   squares marked.
5. Click **Next round** to have another go.

The board can be anything from **3 × 3 to 8 × 8**, with **1–32 pieces**, as long
as they fit. You can set the viewing time anywhere from **2 to 60 seconds**.
A1 is the bottom-left square.

These aren't necessarily legal chess positions. You're remembering where the
pieces are, so you don't need to worry about whose turn it is or whether a king
is in check. There can be more than one of the same piece, just as there is in a normal
set: up to two rooks, bishops and knights, and eight pawns per side, with one king and
queen each.


### Choosing the difficulty

There are six practice choices:

- **Memory fixed board** and **Memory progressive** ask you to rebuild the position.
- **Threats fixed** and **Threats progressive** ask you to remember attacks.
- **Random questions fixed** and **Random questions progressive** mix both sorts
  of question. Question types are shuffled, and a type is skipped if it can't
  produce a useful puzzle with your current settings.

With a **progressive** choice, three perfect rounds in a row take you up to the
next board size, all the way to 8 × 8. Get one wrong and the streak starts again.
Changing the board size or practice mode resets it too. You still choose the
number of pieces and how long you get to look at them.

If you'd rather stay on the same board, choose one of the **fixed** options.

For memory questions, the **Piece palette** setting gives you another choice:

- **Puzzle pieces only** gives you just the pieces that were in the puzzle.
- **All pieces · both colours** gives you all six types in white and black.
  That way the tray doesn't give you a hint about which pieces you saw.

In the full palette, white pieces are on the top row and black on the bottom.
The number under each shape tells you how many are left to place. It only dims
when you've used them all. Returning a piece adds it back to the tray. In the
full palette you have a complete set of 16 pieces per side; in the puzzle-only
palette you have just the pieces you saw. Extra pieces count as mistakes, even
if you've put all the right ones in their places.

### Moving things around

Select a piece on the board to move it. Moving it onto another piece swaps them.
If you put a piece from the tray onto an occupied square, the old piece goes back
to the tray.

**Return selected** puts a selected piece back, and **Clear board** lets you
start your answer again.

You can use the keyboard too: Tab to a piece and press Enter or Space to select
it, then do the same on its square. Delete returns a selected piece to the tray;
Escape deselects it.

### Remembering threats

You'll be asked about either the squares under attack or the opposing pieces
under attack. The question might name all Black or White pieces, or a particular
type, such as Black's bishops. If there are two bishops of that colour, include
both of them.

Remember the whole board first. You won't see the question until the pieces
have disappeared, so you have to picture the position and work out the answer
in your head. Then drag the red X onto the squares, or just tap them. The X in
the tray can be used as many times as you need. Tap with the same symbol to
remove a mark, or use **Clear board** to start again. With the keyboard, Tab to a
tool to choose its symbol, then Tab to a square and press Enter or Space.

For a **squares** question, mark empty squares under attack and squares holding
an opposing piece under attack. Don't mark squares occupied by the attacker's
own pieces: those are defended, rather than threatened. Bishops, rooks and queens
stop at the first piece in their way. Include that square if it's an opposing
piece, but nothing beyond it. Knights can jump.
White pawns attack diagonally towards higher ranks; Black towards lower ranks.
They don't attack straight ahead. Kings attack the adjoining squares. We're
counting attacks, so a pinned piece still counts, even if it couldn't legally
move without exposing its king.

For a **pieces** question, only mark squares that held an opposing piece under
attack. Empty squares and defended friendly pieces don't count for that question.
Some questions ask for every threatened piece, on both sides. Others ask you to
show who's doing the threatening: use a **red X for threats by White** (on Black
pieces), and a **blue circle for threats by Black** (on White pieces). The tools
have labels to help keep that straight. Select the other symbol to change a mark.

Every puzzle has at least one answer to find. If a position has no answers to
the question, the app tries a different position before showing it to you.

### Changing the question wording

If you'd like the questions phrased differently, open
[question_text.json](question_text.json) in a text editor. Each question has a
`name` and `description` to explain what it does, followed by the two bits of
text you'll actually see: `header` and `subhead`. Change those to suit yourself.
You can change the labels under the symbols in `markers` too.

Some questions have placeholders such as `{attacker_colour}`, `{victim_colour}`
or `{attacker}`. Leave those in the text wherever you want the relevant colour
or piece name to appear. There's a list of available placeholders at the top
of the file. For example:

```json
"header": "Which {victim_colour} pieces can {attacker_colour} attack?",
"subhead": "Mark the squares where those pieces were."
```

Keep the question IDs and marker IDs as they are, use double quotes, and don't
put a comma after the last item in an object. Save the file and start another
round; there's no need to restart the app. A round you've already started keeps
its original wording.

### Colour themes

Choose a colour from the menu at the top of the page: Classic (the original green),
Purple, B&W, Blue, Metal, Glass or Wood. Each colour has a light and dark version;
use the button beside the menu to switch between them. Metal, Glass and Wood use
flat colours for now, without textures.

The app starts with your system's light or dark preference. It remembers your
chosen colour and appearance across the memory games and openings practice.

Your other settings are remembered in this browser too, including the board size
you've reached. Round counts and streaks reset when you stop the server. Refreshing
the page abandons the current puzzle, so do that between rounds. Stick to one tab
at a time, as tabs in the same browser share your practice session.

## Learn an opening

Choose **Openings** at the top of the page to practise from the starting position.
Choose White or Black in the playlist. The board faces your side, and your
opponent moves automatically. Select a piece and then its destination, drag it
there, or use Tab and Enter.

There are four repertoire choices to start with:

- **London System · White** builds the setup against …d5 and …Nf6, up to eight moves.
- **Queen's Gambit · White** covers Accepted and Declined lines, up to five moves.
  You play Nf3 after Black takes on c4, and Nc3 after Black plays …e6.
- **Against the London · Black** practises the …d5 and …Nf6 response, up to eight moves.
- **Queen's Gambit Declined · Black** chooses the Declined defence, then practises
  responses to White's Bg5 and Exchange continuations, up to five moves.

The two sides have their own checkboxes and variations. Your White Queen's
Gambit choices don't decide your Black repertoire: you can learn to face both
Accepted and Declined as White while choosing just Declined as Black. Other
good moves can exist; you're learning the particular lines you've chosen here.

The playlist shows each opening with its variations underneath. An opening with
just one line doesn't need a separate variation row. Tick an opening to include
all its lines, or choose individual variations. Unticking every variation also
unticks the opening. You can leave the playlist empty if you want.

The checkboxes decide what goes into practice. Clicking a name brings that
opening or exact variation onto the board straight away, without changing the
checkboxes or playback mode. That works for an unchecked name too.

Open **Layout** below the playlist to adjust its width and the board size. These
settings are remembered in this browser. The board also fits itself to the room
available, and the playlist scrolls rather than growing indefinitely. Names and
side tags stay on one line; a narrow setting may shorten a name, with its full
text available when you hover over it.

Use **Show move ideas** above the playlist to hide or restore explanations; this
choice is remembered too. Hiding them also gives their space back to the board.

When a move has a useful idea behind it, an explanation appears after it's been
played. Your opponent's latest explanation sits beside the playback controls
above the board, with yours below it on larger screens. Both stay available
through the automatic reply, with the move number shown, until that side plays
another explained move or you restart.
Smaller screens place the cards below or beside the board to keep it usable.
They explain moves already played, so they don't show the next move in advance.

The three icon buttons by the board choose how to continue:

- **Shuffle** chooses among your checked openings and their lines.
- **Repeat** cycles through checked variations of the opening and side on the board.
- **Repeat 1** keeps the exact variation on the board, even after you finish it.

Only one mode is active at a time. You can switch while you're playing; it keeps
the current position. A mistake automatically turns on Repeat 1, and briefly
highlights its button so you can see what changed. It stays on until you choose
another mode. The playlist scrolls within its panel as it grows.

Use the **Depth** setting on the main bar to choose **Up to 3**, **Up to 8**, or
another number of moves per side. It's one shared limit for the whole playlist,
kept when you switch openings or repeat modes. A shorter line finishes at its
own length: with Up to 8 selected, the London goes to eight moves and either
Queen's Gambit line finishes at five. The highest available setting follows the
longest enabled line.

Finish the enabled lines at that depth before adding the next move. Shared
prefixes within an opening count once until they branch.

If you play a move outside the line you're studying, your piece moves to the
square you chose with a flashing red outline. After a short pause, the board
goes back to the start. If you prefer reduced motion in your system settings,
the outline stays steady. When you reach the position again, the piece to move
is highlighted. Make a second mistake there and a ghost shows its destination
too. Get that move right once and its hints clear for your next attempt.
Completing a line highlights the well-done message and next-action button.

Your browser remembers the playlist, enabled variations, mode, current repeat
variation, White and Black selections, shared depth and layout for next time. Reloading clears hints, run counts and
completion progress.
Changing the playlist starts a fresh session; changing depth retains hints for
the current openings.

The London explanations follow the [London System setup](https://www.chess.com/openings/London-System).
The Queen's Gambit lines follow the
[Accepted development with Nf3, e3 and Bxc4](https://www.chess.com/openings/Queens-Gambit-Accepted-3.Nf3-Nf6-4.e3-e6-5.Bxc4),
the [Declined setup with Nc3 and Bg5](https://chessbook.com/openings/queens-gambit-declined),
and the [Exchange continuation with cxd5 and exd5](https://www.chess.com/openings/Queens-Gambit-Declined-Exchange-Positional-Line-5...Be7).

## If something isn't working

On Windows, if `py` isn't available but Python is installed, try `python app.py`.
If Windows opens the Store or says it can't find Python, install Python 3.10 or
newer and reopen your terminal. On Linux, make sure `python3` is installed.

If the address is already in use, try a different port:

**Windows (PowerShell)**

```powershell
py -3 app.py --port 8766
```

**Linux**

```bash
python3 app.py --port 8766
```

Then open [http://127.0.0.1:8766](http://127.0.0.1:8766) instead.

If the page won't connect, check that the terminal is still open and the server
is running. If checking an answer fails, your pieces stay on the board so you
can try again. If you've restarted the server, refresh the page and start a
new round.

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
3. Put the pieces back where you remember them. Drag them from the tray onto the
   board, or select a piece and click or tap its square. There's no time limit
   for this part.
4. Click **Check my board**. You can check an unfinished board too. A tick means
   you got that square right; a cross means something was wrong or missing.
   **Show original** lets you compare your answer with the position you saw.
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

With **Progressive training**, three perfect rounds in a row take you up to the
next board size, all the way to 8 × 8. Get one wrong and the streak starts again.
Changing the board size or practice mode resets it too. You still choose the
number of pieces and how long you get to look at them.

If you'd rather stay on the same board, choose **Fixed board size**.

The **Piece palette** setting gives you another choice:

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

### Light and dark mode

Use the button at the top of the page to switch. It says **Dark mode** when you're
in light mode, and **Light mode** when you're in dark mode. The app starts with
your system's preference and remembers it if you choose something else.

Your other settings are remembered in this browser too, including the board size
you've reached. Round counts and streaks reset when you stop the server. Refreshing
the page abandons the current puzzle, so do that between rounds. Stick to one tab
at a time, as tabs in the same browser share your practice session.

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

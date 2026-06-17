# The Mycelial Archive

A private, local-first journal for your D&D character — diary, dreams, spells, creatures, fungi, recipes, and the cycle of death — all stored on your own computer.

This is a four-part guide written for people who have **never installed a programming tool before**. No coding required. Take it slow, follow each step in order, and you'll be fine.

---

## 1. First-time install

You only do this once, on the first day you set up The Mycelial Archive on your computer.

You need two free programs from the official websites. **Don't download them from anywhere else.**

### Step 1 — Install Python

1. Go to **https://www.python.org/downloads/**
2. Click the big yellow button that says **"Download Python"** (any version 3.10 or newer is fine).
3. Open the file you just downloaded.
4. **Very important:** at the bottom of the first window, tick the box that says **"Add python.exe to PATH"** (on Windows) or **"Add Python to environment variables"**. If you miss this, the launcher won't be able to find Python later.
5. Click **"Install Now"** and wait for the green checkmark. Close the window.

### Step 2 — Install Node.js

1. Go to **https://nodejs.org/**
2. Click the button labelled **"LTS"** (the recommended version for most people).
3. Open the file you just downloaded and click **Next → Next → Install** with all the defaults. You don't need to tick any extra boxes.
4. Wait for it to finish, then close the window.

### Step 3 — Start the Archive

1. Open the folder where you saved The Mycelial Archive (the folder with this README in it).
2. Double-click **`launcher.py`**.
   - If a window asks "How do you want to open this file?", choose **Python**.
   - If you prefer the command line: open a Terminal (macOS/Linux) or Command Prompt (Windows) inside that folder and type:
     ```
     python launcher.py
     ```
3. The first launch takes a few minutes — it's installing everything it needs in the background. Be patient.
4. When it's ready, your browser will open to **The Mycelial Archive**.

That's it. You're done with the setup.

---

## 2. Daily launch

Every other time you want to use The Mycelial Archive:

- **Easiest:** double-click the **desktop shortcut** the launcher created for you on your first run. (If you don't have one yet, run `python create_shortcut.py` once from the project folder.)
- **Or:** open the Archive folder and double-click `launcher.py` again.
- **Or, from a terminal:**
  ```
  python launcher.py
  ```

The launcher starts everything quietly in the background and opens your browser. When you're done writing, just close the launcher window — it will tidy up after itself.

---

## 3. Backup

Everything you write — every diary entry, every spell, every memory — lives in **one folder** on your computer:

```
~/.mycelial-archive/
```

- On **Windows**, that's: `C:\Users\<your name>\.mycelial-archive\`
- On **macOS / Linux**, that's: `/Users/<your name>/.mycelial-archive/` or `/home/<your name>/.mycelial-archive/`

(If you can't see the folder, your file manager is probably hiding "dot" folders. Turn on "Show hidden files" in your file manager's View menu.)

To back up your archive:

1. **Close** the launcher window first (so nothing is being written).
2. **Copy** the entire `.mycelial-archive` folder somewhere safe — a USB stick, an external drive, Dropbox, Google Drive, iCloud, anywhere you trust.
3. To restore on a new computer: install Python + Node like in Part 1, then drop the backed-up `.mycelial-archive` folder into your home directory before launching.

That's the whole backup story. One folder. Copy it. You're safe.

---

## 4. Troubleshooting

### "Port already in use" or "Address already in use"

Something else on your computer is using the same door the Archive wants to use.

- **Easy fix:** close the launcher, wait 30 seconds, then start it again.
- **If that doesn't work:** restart your computer. This always clears the port.
- **Still stuck?** You probably have another copy of the Archive (or another web app) already running. Look in your taskbar / dock for a leftover terminal window and close it.

### "Python is not recognized" / "python: command not found"

The installer in Part 1 didn't tick the **"Add Python to PATH"** box.

- **Fix:** open `https://www.python.org/downloads/` again, run the installer, and this time **first click "Modify"**, then make sure **"Add Python to environment variables"** is ticked. Finish the installer and try again.
- On macOS, if `python` doesn't work, try `python3 launcher.py` instead.

### The browser didn't open / I just see a blank page

- Wait a full minute the first time — it's still warming up.
- Open your browser yourself and type **`http://localhost:3000`** into the address bar.
- If you see an error message, close the launcher and run it again. The second start is always faster and usually fixes things.

### "Node is not recognized" / npm errors

Same problem as Python, but for Node.js. Re-run the Node.js installer from `https://nodejs.org/` with the default settings, then restart your computer and try the launcher again.

### Everything looks broken / I want to start fresh

You can safely delete the `node_modules` and `__pycache__` folders inside the project — the launcher will rebuild them next time. **Don't delete `~/.mycelial-archive/`** unless you want to lose your writing.

---

*Tend the archive gently. The mycelium remembers.*

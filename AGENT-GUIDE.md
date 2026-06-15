# Agent Guide — Creating a New Version of the Practice Challenge App

This document provides everything an AI agent needs to create or modify a new version of the OLM Blues Practice Challenge app.

## Overview

The app is a **single HTML file** (~44KB) that includes all CSS, HTML, and JavaScript inline. It uses Firebase Realtime Database for cross-device sync with localStorage as offline fallback.

## File Structure

```
index.html          — The complete app (production)
test-harness.js     — Core logic extracted for testing (mirrors app functions)
test-framework.js   — Minimal test runner (suite/test/assert/eq)
tests-part1.js      — Tests: PINs, sessions, logging, coach CRUD
tests-part2.js      — Tests: streaks, leaderboard, personas, edge cases, animations
run-tests.js        — Entry point to run all tests
badge.png           — Team badge (optional, not embedded in current version)
```

## Key Constants to Change for a New Version

All are defined near the top of the `<script>` block in `index.html`:

| Constant | Description | Example |
|----------|-------------|---------|
| `PLAYERS` | Array of player names | `['Sophie','Sylvie',...]` |
| `DEFAULT_EMOJIS` | Fallback emojis before players pick their own | `['⚡','🌟',...]` |
| `EMOJI_OPTIONS` | Emojis available in the picker | `['⚽','🌟','💫',...]` |
| `DRILLS` | Array of `{id, emoji, name}` objects | `[{id:'dribbling',emoji:'⚽',name:'Dribbling'},...]` |
| `START` | Challenge start date | `new Date('2026-04-03')` |
| `END` | Challenge end date | `new Date('2026-04-19')` |
| `TOTAL_DAYS` | Number of days in challenge | `17` |
| `PRIZE_TARGET` | Days needed to earn a prize | `10` |
| `FIREBASE_CONFIG` | Firebase project config object | See Firebase Setup section |

### Also update in `test-harness.js`:
- `PLAYERS` array
- `DRILLS` array
- `START`, `END`, `TOTAL_DAYS`, `PRIZE_TARGET`

## App Structure (within index.html)

### HTML Pages (controlled by `showPage()`)
- `page-setup` — Player selection grid
- `page-emoji-pick` — Emoji chooser for new players
- `page-pin-create` — PIN creation (enter twice)
- `page-pin-enter` — PIN verification on return
- `page-log` — Daily practice logging (date picker, drill multi-select, duration, note)
- `page-leaderboard` — Ranked player list
- `page-profile` — Individual player stats, calendar, history
- `page-drills` — Video links and training content
- `page-admin` — Coach-only admin panel

### Data Model (stored in Firebase/localStorage)

**Practice data** (`olm-blues-v1`):
```json
{
  "Sophie": {
    "2026-04-03": {
      "drills": ["Dribbling", "Passing"],
      "drillIds": ["dribbling", "passing"],
      "note": "Great session",
      "duration": 20,
      "time": "10:30"
    }
  }
}
```

**PINs** (`olm-blues-pins`):
```json
{ "Sophie": "1234", "Coach": "9999" }
```

**Emojis** (`olm-blues-emojis`):
```json
{ "Sophie": "🦄", "Sylvie": "🌸" }
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `getData()` / `saveData(d)` | Read/write practice data (syncs to Firebase) |
| `getPins()` / `savePins(d)` | Read/write PIN data |
| `getEmojis()` / `saveEmojis(d)` | Read/write emoji selections |
| `getStreak(name)` | Count consecutive days backwards from today within challenge window |
| `getTotalDays(name)` | Count total days practiced within challenge window |
| `getTotalMinutes(name)` | Sum duration of all sessions within challenge window |
| `logPractice()` | Main logging function (reads UI, saves entry, triggers animations) |
| `renderLeaderboard()` | Builds leaderboard sorted by days then minutes |
| `showProfile(name)` | Renders player profile with calendar, stats, history |
| `fireConfetti(type)` | Triggers themed animation (default/football/trophy/taylor) |
| `showToast(msg, err, duration)` | Shows notification popup |
| `renderAdmin()` | Coach admin panel |
| `adminAddEntry/editEntry/deleteEntry` | Coach CRUD operations via modals |

### Animation Tiers (in `logPractice()`)

| Trigger | Animation | Message |
|---------|-----------|---------|
| Streak 1-2 | Default confetti | "🔥 X-day streak — great start!" |
| Streak 3-4 | Default confetti | "🔥 X-day streak!" (pulsing) |
| Streak 5-12 | ⚽ Football emoji rain | "Amazing — keep it going!" |
| Streak 13+ | 💜🎤 Taylor Swift emoji rain | "Taylor would be proud!" |
| Total days = PRIZE_TARGET | 🏆 Trophy emoji rain | "YOU HAVE WON A PRIZE! Tap to reveal!" → reveals chocolate |

### Leaderboard Sorting
1. Total days (descending)
2. Total minutes (descending, tiebreaker)

### Firebase Sync
- Writes go to both localStorage and Firebase
- Firebase listeners update local cache and refresh UI on changes
- Works offline with localStorage alone (no Firebase = local-only mode)

## How to Create a New Theme/Version

### 1. Change the challenge window
```javascript
const START = new Date('2026-07-01');
const END = new Date('2026-07-21');
const TOTAL_DAYS = 21;
```

### 2. Update players (if squad changed)
```javascript
const PLAYERS = ['Sophie', 'NewPlayer', ...];
```

### 3. Add/change drill categories
```javascript
const DRILLS = [
  {id:'dribbling', emoji:'⚽', name:'Dribbling'},
  {id:'new-drill', emoji:'🏴', name:'New Drill'},
  ...
];
```

### 4. Change the theme
- Edit CSS variables in `:root` for colours
- Update header text/badge
- Change animation themes in `fireConfetti()`

### 5. Update drills page
- Edit the `page-drills` HTML section with new video links and descriptions

### 6. Change prize
- Edit `revealPrize()` function to change what's revealed
- Adjust `PRIZE_TARGET` if threshold changes

### 7. Fresh Firebase
- Create a new Firebase project or clear the existing database
- Update `FIREBASE_CONFIG` in the script

### 8. Update tests
- Mirror all constant changes in `test-harness.js`
- Update persona definitions in `tests-part2.js` if players change
- Run `node run-tests.js` to verify

## Deployment Checklist

1. ✅ Update constants (dates, players, drills)
2. ✅ Update Firebase config (or create new project)
3. ✅ Update drills page content
4. ✅ Update test harness to match
5. ✅ Run tests: `node run-tests.js` — all should pass
6. ✅ Test locally by opening `index.html` in browser
7. ✅ Deploy to Netlify (drag & drop)
8. ✅ Share URL via WhatsApp
9. ✅ Clear Firebase database if reusing project from previous challenge

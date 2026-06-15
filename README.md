# OLM Girls Blues — Practice Challenge App ⚽

A self-contained PWA for tracking youth football practice during school breaks. Built for the OLM Girls Blues U12s team.

## Features

- 📝 Daily practice logging with multiple drill categories and duration tracking
- 🏆 Live leaderboard with real-time Firebase sync across all devices
- 🔥 Streak tracking with tiered animations (fire → footballs → Taylor Swift)
- 🏆 Prize system — trophy animation + reveal at 10 total days
- 🔐 4-digit PIN per player to prevent logging as someone else
- 🧑‍🏫 Coach admin panel — PIN resets, add/edit/delete entries
- 🎥 Drill videos section with curated YouTube content
- 😀 Custom emoji picker per player
- ⏱️ Duration tracking and total minutes on leaderboard
- 📱 Works offline, mobile-first, "Add to Home Screen" capable

## Quick Start

1. Open `index.html` in a browser — that's it! Works as a local file.
2. For shared leaderboard: configure Firebase (see below) and host on Netlify.

## Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → Build → Realtime Database → Create Database → Test mode
3. Project Settings → Your apps → Web → Register → Copy config values
4. Edit `index.html` and replace the `FIREBASE_CONFIG` values
5. Deploy to Netlify and share the URL

## Hosting (Netlify — free)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop `index.html`
3. Share the URL via WhatsApp

## Running Tests

```bash
node run-tests.js
```

90 tests across 15 suites covering PINs, logging, streaks, leaderboard, coach admin, multi-drill, duration, and animation thresholds.

## Creating a New Version

See [AGENT-GUIDE.md](AGENT-GUIDE.md) for full instructions on how to customise for a new challenge (different dates, players, themes, etc.)

## Architecture

Single HTML file containing:
- CSS (inline styles)
- HTML structure (all pages/tabs)
- JavaScript (data layer, Firebase sync, UI logic, animations)

Data is stored in Firebase Realtime Database with localStorage as fallback/cache.

## Easter 2026 Challenge

- **Dates:** April 3–19 (17 days)
- **Players:** Sophie, Sylvie, Annie, Eva, Chloe, Esme, Marnie, Hannah, Aminah, Orla, Layla, Rebecca, Collette
- **Prize:** Bar of chocolate for 10+ days; bigger prize for 1st place
- **Drill categories:** Dribbling, Shooting, Passing, Fitness, Ball Mastery, First Touch, Receiving, Goalkeeping, Other

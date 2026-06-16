# OLM World Cup Challenge ⚽🏆

A World Cup-themed summer training challenge app for OLM youth football teams.

## Features

- 🏆 **World Cup Theme** — Girls pick a WC team and earn bonus points as their team progresses
- 📝 **Training Logging** — Log daily sessions (min 10 mins) to earn points
- 🌟 **Moment of the Week** — Recreate a WC moment for bonus points
- 🎯 **Drill of the Week** — Complete coach's drill challenge for bonus points
- 🏴󠁧󠁢󠁳󠁣󠁴󠁿 **Scotland Double Points** — Pick Scotland for 2x WC progression bonus
- 🏆 **Leaderboard** — Real-time ranked leaderboard with points breakdown
- 🔔 **Notifications** — Active challenges shown on login
- ⚙️ **Coach Admin** — Manage players, WC progress, challenges, entries
- 🔐 **PIN Auth** — Simple 4-digit PIN per player

## Points System

| Action | Points |
|--------|--------|
| Training session (min 10 mins) | 1 point |
| Moment of the Week completed | 1 bonus point |
| Drill of the Week completed | 1 bonus point |
| WC team reaches Last 32 | 1 bonus point |
| WC team reaches Last 16 | 1 bonus point |
| WC team reaches Quarter Finals | 1 bonus point |
| WC team reaches Semi Finals | 1 bonus point |
| WC team reaches Final | 1 bonus point |
| WC team wins | 1 bonus point |
| **Scotland picker** | All WC points **doubled** |
| **Prize target** | **39 points** |

## Challenge Period

- **Start:** 15 June 2026
- **End:** 17 August 2026
- **Prize:** Top trainer wins a prize + anyone reaching 39 points wins a prize

## Quick Start

1. Open `index.html` in a browser
2. For shared leaderboard: uses existing OLM Blues Firebase project
3. Deploy to Netlify (drag and drop) and share URL

## Firebase

Uses the same Firebase project as the Easter challenge (`olm-blues`). Data is stored under a `wc/` prefix to keep it separate.

## Deployment (Netlify)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the `index.html` file
3. Share the URL via WhatsApp

## Coach Admin Features

- Add/remove players
- Reset PINs
- Update WC progress (which teams made each round)
- Add Moment of the Week (title + video link, expires in 7 days)
- Add Drill of the Week (title + description + video, expires in 7 days)
- Delete player entries

## Multi-Team Support (Coming Soon)

The app is structured to support multiple teams. Lead coaches can add other coaches and manage their own team independently.

## 48 World Cup Teams (2026)

All 48 qualified teams from FIFA World Cup 2026 (USA/Mexico/Canada) are included with flags and group assignments.

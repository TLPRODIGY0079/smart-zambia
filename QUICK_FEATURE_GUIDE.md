# Smart Zambia - Quick Feature Guide

## 🚀 New Features Quick Reference

---

## 1. Services Tab

### How to Access

1. Open Smart Zambia app
2. Click "Services" tab in navigation
3. Choose a category

### Categories

- 🍽️ **Restaurants** — dining options  
- 🔧 **Repair Services** — repair listings  
- 🏠 **Real Estate** — property listings  
- 💼 **Professional Services** — service providers  

### Actions

- Click service card → View details  
- Click "Call Now" → Opens phone dialer  
- Click "Book Service" → Send booking request  
- Earn XP: +3 view, +5 call, +10 book  

---

## 2. Easter Eggs (no public spoilers)

Gamified surprises exist (search timing, bursts of activity, profile text, milestones, and similar). Rewards and exact triggers are intentionally **not** documented here—keep them out of public docs so curious users rely on clues inside the experience.

Historical deep-dive Markdown files (`EASTER_EGGS_COMPLETE.md`, etc.) describe **obsolete** behaviours; ignore them unless you intentionally restore old flows.

Canonical client code: **`public/index.html`** (Netlify deployment). **`smart-zambia-frontend/`** tracks parity via `CANONICAL_SOURCE.md`.

---

## 3. Super Admin Panel

### Access

- Path: **`/superadmin.html`** (static demo-style panel in-repo).  
- **Do not embed credentials in documentation.** Provision admin identities via your secure process (secrets manager, one-time onboarding, rotated passwords).

### Operational notes

- Treat any built-in defaults as **unsafe for production**. Change passwords, rotate keys, and gate access behind infrastructure controls before exposing to the Internet.  
- Audit `public/superadmin.html` and related handlers before launch; rely on authenticated backend routes for privileged operations wherever possible.

### Features

- Dashboard aggregates (counts depend on integrations)  
- User list / moderation patterns (where wired)  
- Civic report review workflows (where wired)  
- Export / backups (where implemented)

---

## 📱 User Features

### Profile System

- Edit profile (name, email, location, bio)  
- Upload profile image  
- View stats (XP, level, streak)  
- See achievements  
- Treasure hunt progress and activity  

### Gamification

- Earn XP from actions  
- Levels and badges  
- Login streaks, treasure hunts, civic challenges  

### Community & exploration

As implemented in **`public/`** — maps, destinations, reviews, buddies, civic reporting.

---

## 🎯 Quick Actions

### For users

Explore destinations, Services, Profile, Community.

### For operators / developers

1. Run API smoke checklist: **`smart-zambia-api/API_SMOKE_CHECKLIST.md`**  
2. Frontend source of truth: **`public/`**  
3. Keep mirrors aligned: **`smart-zambia-frontend/CANONICAL_SOURCE.md`**  

---

## 💡 Tips

- Maximize XP through consistent engagement and platform features—not by hunting leaked cheat sheets in docs.  
- Admins rotate credentials frequently and store them outside the repo.

---

## 🔧 Troubleshooting

### Services Not Loading

- Refresh, check cache/network.

### Secrets showed up somewhere they should not?

- Rotate affected credentials immediately, scrub docs and git history policy per your security process.

### Data Not Saving

- Confirm `localStorage` is allowed (avoid strict private mode issues for client-only UX).

---

## 📊 Feature Status

High-level roadmap items live in Markdown plans in-repo—verify against **`public/`** before trusting any “done” checklist.

---

## 📞 Related docs

| Doc | Purpose |
|-----|---------|
| `SERVICES_TAB_COMPLETE.md` | Services tab notes (may drift) |
| `smart-zambia-api/API_SMOKE_CHECKLIST.md` | API + Postgres verification |
| `smart-zambia-frontend/CANONICAL_SOURCE.md` | Frontend duplication policy |
| `QUICK_BACKEND_SETUP.md` | Generic backend bootstrap notes |

---

**Last Updated**: incremental maintenance (guides scrubbed for credential leaks).

**Need Help?** Prefer code and checklists linked above over outdated narrative specs.

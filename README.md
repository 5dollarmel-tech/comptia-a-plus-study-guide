# CompTIA A+ Ultimate Study Guide

A complete, free, self-contained study guide for the CompTIA A+ 220-1201 (Core 1) and 220-1202 (Core 2) exams — lessons, a full glossary, 198 flashcards with mastery tracking, a 30-question timed practice exam, and a 16-question PBQ (Performance-Based Question) simulator with real drag-to-order and drag-to-match mechanics.

**Live site:** `https://<your-github-username>.github.io/comptia-a-plus-study-guide/`
*(replace with your actual username once deployed — see setup below)*

## What's included

- **14 main sections**: Overview, Lessons, Glossary, Mobile Devices, Ports, Hardware, Commands, Subnetting, Security, OS & Software, Operational Procedures, Flashcards, Exam Sim, PBQ Sim
- Every piece of content is labeled **Core 1** or **Core 2** so you always know which exam you're studying
- Content checked line-by-line against CompTIA's official V15 exam objectives for both exams
- 17 guided lessons, each structured like a short class: hook → teaching sections → worked scenario → common mistakes → recap → self-check
- 198 flashcards with per-card hints and persistent mastery tracking (stored in your browser's local storage — nothing leaves your device)
- Timed 30-question practice exam with a domain-by-domain score breakdown
- 8 drag-to-order PBQs and 8 drag-to-match PBQs, mirroring the real exam's performance-based question format

## Running it locally

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/comptia-a-plus-study-guide.git
cd comptia-a-plus-study-guide

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

This opens the app at `http://localhost:5173` with hot-reload — edit `src/App.jsx` and see changes instantly.

## Building for production

```bash
npm run build
```

This outputs a static, deployable site to the `dist/` folder.

## Deploying to GitHub Pages (already set up)

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the site to GitHub Pages every time you push to the `main` branch. To activate it on your own copy of this repo:

1. Push this repo to GitHub under whatever name you like.
2. **If you rename the repo** from `comptia-a-plus-study-guide`, open `vite.config.js` and update the `REPO_NAME` constant to match — this is required or the deployed site will show a blank page.
3. In your repo on GitHub, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, select **GitHub Actions**.
5. Push any commit to `main` (or go to the **Actions** tab and manually run the "Deploy to GitHub Pages" workflow).
6. After it finishes (usually under a minute), your site is live at `https://<your-username>.github.io/comptia-a-plus-study-guide/`.

## Project structure

```
comptia-a-plus-study-guide/
├── .github/workflows/deploy.yml   # Auto-deploy to GitHub Pages on push
├── src/
│   ├── App.jsx                    # The entire application (all content + UI)
│   └── main.jsx                   # React mount point
├── index.html                     # HTML entry point
├── vite.config.js                 # Build config (note the REPO_NAME setting)
├── package.json
└── README.md
```

Everything — every lesson, flashcard, port number, command, and PBQ — lives in `src/App.jsx`. It's a single large file by design, so all study content is easy to search and edit in one place.

## Tech stack

Plain React + Vite. No backend, no database, no external API calls. Flashcard progress is saved with `localStorage`, so it persists across visits on the same browser/device but never gets sent anywhere.

## Disclaimer

This is an independently created study aid and is **not affiliated with or endorsed by CompTIA**. Content was built and cross-checked against CompTIA's publicly published exam objectives for the 220-1201 and 220-1202 exams (V15), but CompTIA's live exam question bank is confidential and not accessible to anyone outside CompTIA — no study guide, including this one, can be verified against actual exam questions.

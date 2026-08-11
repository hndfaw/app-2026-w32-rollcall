# Rollcall

**Live app: https://hndfaw.github.io/app-2026-w32-rollcall/**

> Offline-first attendance and gradebook for trainers running classes where connectivity is bad.

Field trainers still track attendance on paper or in spreadsheets stranded on one laptop,
because cloud tools assume accounts, subscriptions, and a connection. Rollcall runs
entirely in the browser: build your roster, tap through each session
(present / absent / late / excused), see who's at risk of dropping out, keep a simple
gradebook, and print an A4 report or export CSV — all working offline after first load,
no accounts, no keys.

## Features

- **Roster & classes** — multiple classes side by side; add, edit, and archive participants
- **Session marking** — big touch targets, fast enough to use live in front of a class
- **Attendance analytics** — per-participant rates, absence streaks, and an at-risk list
  (missed N of the last M sessions), plus per-class trends
- **Gradebook** — assessments with scores and per-participant averages next to attendance
- **Reports** — print-ready A4 class report and CSV export of attendance and grades
- **Offline-first** — everything lives in `localStorage`; a demo class shows the flow

## How to use

1. **Roster** — create a class, add participants (edit or archive them any time).
2. **Sessions** — start a session and tap each participant present / absent / late /
   excused; a demo class with sample history is preloaded so you can try this immediately.
3. **Analytics** — open a class dashboard for attendance rates, absence streaks, an
   at-risk list (missed N of the last M sessions), and a session trend.
4. **Gradebook** — define assessments and enter scores; per-participant averages sit next
   to attendance.
5. **Reports** — print an A4 class report or download CSV exports of attendance and grades.

Everything is stored in `localStorage` in your browser — no account, no server, works
offline after the first load.

## Run locally

```bash
npm install
npm run dev      # start the dev server
npm test         # run the Vitest suite
npm run build    # type-check and produce a production build in dist/
npm run preview  # preview the production build locally
```

## Deploy

Pushes to `main` build and publish `dist/` to GitHub Pages automatically via
`.github/workflows/deploy.yml`. Pull requests run `.github/workflows/ci.yml`
(tests + build) before merge.

## Project layout

```
src/core/        pure logic — data model, analytics (rates, streaks, at-risk),
                 CSV generators, localStorage layer
src/components/  roster, session-marking, dashboard, gradebook, and report UI
src/App.tsx      the shell wiring it together
```

The analytics and export logic are pure functions with unit tests next to each module;
React is only the shell around them.

## License

[MIT](LICENSE)

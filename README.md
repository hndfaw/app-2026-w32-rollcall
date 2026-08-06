# Rollcall

> Offline-first attendance and gradebook for trainers running classes where connectivity is bad.

Field trainers still track attendance on paper or in spreadsheets stranded on one laptop,
because cloud tools assume accounts, subscriptions, and a connection. Rollcall runs
entirely in the browser: build your roster, tap through each session
(present / absent / late / excused), see who's at risk of dropping out, keep a simple
gradebook, and print an A4 report or export CSV — all working offline after first load,
no accounts, no keys.

**Status:** in active development (target: 2026-08-12). A live URL will appear here when
the first deployable version ships.

## Features

- **Roster & classes** — multiple classes side by side; add, edit, and archive participants
- **Session marking** — big touch targets, fast enough to use live in front of a class
- **Attendance analytics** — per-participant rates, absence streaks, and an at-risk list
  (missed N of the last M sessions), plus per-class trends
- **Gradebook** — assessments with scores and per-participant averages next to attendance
- **Reports** — print-ready A4 class report and CSV export of attendance and grades
- **Offline-first** — everything lives in `localStorage`; a demo class shows the flow

## Run locally

```bash
npm install
npm run dev      # start the dev server
npm test         # run the Vitest suite
npm run build    # type-check and produce a production build in dist/
npm run preview  # preview the production build locally
```

## Project layout

```
src/core/        pure logic — data model, analytics (rates, streaks, at-risk),
                 CSV generators, localStorage layer
src/components/  roster, session-marking, dashboard, gradebook, and report UI
src/App.tsx      the shell wiring it together
```

The analytics and export logic are pure functions with unit tests next to each module;
React is only the shell around them.

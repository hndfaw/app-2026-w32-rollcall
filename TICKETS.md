# Tickets — Rollcall

- **Deadline:** 2026-08-12
- **Total:** 14
- **Cadence:** one PR per build firing, hourly 6–11 PM ET,
  quota = ceil((remaining + opened_today) / days_left) — start-of-day remaining

Ordered so the repo stays runnable throughout: scaffolding first, pure logic next,
UI on top, deploy + done-pass last.

| # | Ticket | Status | PR | Date |
|---|--------|--------|----|------|
| 1 | Scaffold Vite + React + TypeScript project with npm scripts | done | #1 | 2026-08-05 |
| 2 | Add Vitest setup, test script, and a smoke test | done | #2 | 2026-08-05 |
| 3 | Data model: classes, participants, sessions, attendance marks, assessments + validation + tests | done | #3 | 2026-08-06 |
| 4 | localStorage persistence with schema version + migration guard + tests | done | #4 | 2026-08-06 |
| 5 | Analytics engine: attendance rate, absence streak, at-risk list (missed N of last M), class trends + tests | done | #5 | 2026-08-07 |
| 6 | CSV export: attendance and grades generators (pure functions) + tests | done | #6 | 2026-08-07 |
| 7 | Roster UI: create classes, add/edit/archive participants | done | #7 | 2026-08-07 |
| 8 | Session marking UI: start session, tap present/absent/late/excused, big touch targets | done | #8 | 2026-08-08 |
| 9 | Analytics UI: per-class dashboard — rates, streaks, at-risk list, session trend | done | #9 | 2026-08-08 |
| 10 | Gradebook UI: define assessments, enter scores, per-participant averages | done | #10 | 2026-08-08 |
| 11 | Report view: per-class A4 print-CSS report + CSV download buttons | todo | | |
| 12 | Demo class + empty-state onboarding; polish pass (navigation, responsive, a11y basics) | todo | | |
| 13 | GitHub Pages deploy + CI: vite base path, ci.yml (vitest+build on PR), deploy.yml | todo | | |
| 14 | Definition-of-done pass: LICENSE, live-URL check, machine cleanup, mark Done | todo | | |

## Specs for tickets 13–14 (so any Builder session implements exactly this)

**Ticket 13 — deploy + CI:**
- `vite.config.ts`: add `base: '/app-2026-w32-rollcall/'`.
- `.github/workflows/ci.yml`: `on: pull_request` → checkout@v4, setup-node@v4 (node 22,
  `cache: npm`), `npm ci`, `npm test`, `npm run build`.
- `.github/workflows/deploy.yml`: `on: push` to `main`; permissions contents:read,
  pages:write, id-token:write; concurrency group `pages`; build job (`npm ci && npm run
  build`, configure-pages@v5, upload-pages-artifact@v3 with `path: dist`) then deploy job
  (`environment: github-pages`, deploy-pages@v4).
- Enable Pages once: `gh api -X POST repos/hndfaw/app-2026-w32-rollcall/pages -f build_type=workflow`
  (PUT if it already exists). Live URL: `https://hndfaw.github.io/app-2026-w32-rollcall/`.

**Ticket 14 — definition-of-done pass (must be the last ticket):**
- README: live URL, run/deploy instructions, how to use (roster → mark sessions →
  analytics → print report / CSV).
- MIT `LICENSE` (copyright 2026 Hindreen Abdullah).
- Verify `curl -sIL https://hndfaw.github.io/app-2026-w32-rollcall/ | head -1` → 200 and the
  latest CI + deploy runs are green.
- **Machine cleanup — non-negotiable before Done:** kill any vite dev/preview servers
  (ports 5173/4173), uninstall anything installed only for testing, `git fetch --prune`,
  delete merged `ticket/*` branches locally and on origin.
- Only then set `PROGRESS.md` status to `Done` and flip `"status": "done"` in
  `~/code/weeklylab/state.json`.

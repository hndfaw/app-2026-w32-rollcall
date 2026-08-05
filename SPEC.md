# Rollcall

> Offline-first attendance and gradebook for trainers running classes where connectivity is bad — roster, tap-to-mark sessions, analytics, printable reports.

- **Week:** 2026-W32   **Created:** 2026-08-05
- **Repo:** app-2026-w32-rollcall

## Problem
Trainers and teachers in field settings — NGO training programs, community classes, camps,
village schools — still track attendance on paper or in spreadsheets that live on one
laptop. Cloud tools assume an account, a subscription, and a connection; the field has
none of those. The result: attendance data that's late, lost, or never analyzed, when
attendance is often *the* indicator a program is asked to report. Rollcall runs entirely
in the browser, works with zero connectivity after first load, and turns taps into the
report the program manager actually needs.

## Target user
Trainers, teachers, and facilitators running recurring classes or training cohorts in
low-connectivity settings — NGO field staff first (the AidGround world), but any coach,
tutor, or workshop leader with a roster fits.

## MVP features (the week's roadmap)
- [ ] **Roster & classes** — create classes, add participants (name, ID, notes), move or
      archive them; multiple classes side by side
- [ ] **Session marking** — start a session for a class and tap each name:
      present / absent / late / excused; big touch targets, fast enough to use live
- [ ] **Attendance analytics** — per-participant attendance rate, current absence streak,
      and an at-risk list (e.g. missed N of the last M sessions); per-class session trends
- [ ] **Gradebook** — define assessments per class (name, max score), enter scores,
      per-participant averages alongside their attendance
- [ ] **Reports** — a per-class report view (print-CSS for A4) and CSV export of both
      attendance and grades; works with no connection
- [ ] **Offline-first** — localStorage persistence with schema versioning, a demo class,
      no accounts, no keys

## Stretch (only if time)
- Participant detail page: personal attendance history calendar
- JSON backup export/import (move data between devices)
- Configurable at-risk threshold and session labels

## Tech stack
- **Vite + React + TypeScript** — the lab's proven pipeline; deploys to GitHub Pages.
- **Vitest** — analytics (rates, streaks, at-risk), CSV generation, and storage migration
  are pure functions; ideal unit tests.
- **localStorage + print CSS** — zero backend, zero keys; offline is the whole point.

## Non-goals
- No accounts, sync, or multi-device collaboration this week (JSON export is the bridge).
- No scheduling/timetabling — sessions are created when the trainer starts one.
- Not a full M&E system: no indicators, no beneficiary registry — attendance + grades only.
- No photos or biometric anything.

## Definition of done (for the week)
All MVP boxes checked; a trainer can create a class of 15, mark 3 sessions, enter one
assessment, and print a clean A4 report — in under 10 minutes, with the network disabled
after first load, learning it from the README alone.

Plus the standing lab bar (every weekly app, non-negotiable):
- [ ] Deployed at a public URL (or installable release) that actually responds
- [ ] CI green: tests + build run on every PR
- [ ] README explains how to run, deploy, and use it; LICENSE present
- [ ] Machine cleanup: dev servers killed, test-only installs removed, no stray
      processes/ports/tabs, merged ticket branches pruned

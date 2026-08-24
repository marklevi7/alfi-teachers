# ALFI for Teachers TODO — 23 Aug 2026, v1

Source: "ALFI - Kickoff Teacher Screens" call, 23 Aug 2026 (Mark, Einav Brosh, Uri Avrah) — first functional tour of the current teacher system, Einav walked through the logic of every screen. Most of what exists today disappears or changes completely.

## Open — screens to (re)design, Figma v1 (Mark)

Read Trello comments before starting.

1. **מסך ראשי → new analytics dashboard.** The current "תרגולים שנשלחו" card-list screen (what's scaffolded in this repo right now) disappears entirely. Replaced by:
   - Graph of the last 5 evaluations sent (avg score + submission % for each)
   - Pie chart: active vs. inactive students, last 7 days
   - Below the graphs: list of inactive students, list of red-flagged students (low scores)
   - No heatmap / מפת שליטה
   - [x] Class selector (בורר כיתה) moves from main screen to the side nav, under the logo, visible from every screen — **already built this way in the scaffold**, confirmed correct by this meeting.

2. **מצב התלמידים** — stays functionally similar. Heatmap table: students on the Y axis, practice dates on the X axis, status colors (עובר / לא עובר / הוגש חלקית / לא הוגש). Teachers want as many day-columns visible as possible — goal is a wide view of the whole class over the last month. Vertical scroll up to ~30 student rows; horizontal scroll by day.

3. **Student drill-down popup** — reuse the component already designed for the student screens (Mark: easiest part of this). Key difference: teacher must be able to **edit the grade** (field already exists in dev, range 0–110). Editing the AI feedback text: undecided, needs checking.

4. **בניית מבחן / בניית תרגול** — stay separate for now. Test = start + end time required, same day. Practice = default creation-date → end of year, editable. Default practice name already implemented in dev. Missing: difficulty filter (קל/בינוני/קשה) in the question list — Uri to add.

5. **ניהול משימות screen removed.** Merges into תוצאות הערכות, renamed **"כל הערכות."** Chronological list: future/unsent tasks on top (grey/blue), everything sent below. Statuses: sent & fully done / partially done / not done / future (not yet sent). A future-task card shows its planned send date, and swaps the "צפה בסיכום" button for **"ערוך משימה."**

6. **Evaluation creation flow** — two paths: pick individual questions (builds a new evaluation) or pick a whole existing evaluation (assigns it as-is). Einav: existing evaluations are a core part of the value prop. The "source" selector (single question vs. whole set) needs to be far more prominent — currently a dropdown buried in filters, easy to lose track of (Mark forgot which mode he was in within 40 minutes). Einav's suggestion: make it a prominent top tab instead. Default filter = "הכל," though Einav noted teachers usually arrive already knowing their topic and won't browse a general list.

## Open questions — not yet decided, don't design around them yet

- AI feedback editing in the student drill-down — needs a decision.
- Assigning one practice to more than one class — doesn't exist as a feature yet. Einav: exclude from design until it's defined.
- Merging בניית מבחן + בניית תרגול into one "בניית הערכה" flow with a type-picker up front — Mark proposed it, Einav worried it's less intuitive for teachers. Decision: run it by the pedagogical team first.

## Bug noticed (current system)

- Logout takes ~3–4 seconds with no loading feedback. Uri and Einav hadn't noticed before.

## Action items

- [ ] **Uri** — confirm with the team whether tags (תגיות) are still used, or whether the sub-topic hierarchy changed. Affects the question-filter design.
- [ ] **Mark** — design teacher screens v1 in Figma per the list above.
- [ ] **Mark** — Visual QA pass on the **student** screens (not teacher): reviewed everything except the "פג תוקף" button; QA on that is blocked until dev finishes it. Einav: don't wait — open focused Trello tickets now (font, hamburger, timeline, etc.) with screenshots, since dev is already ~80–85% done. Mark documents in Trello on his side, Einav forwards to the dev Trello.

## Done

- [x] Scaffolded from the student ALFI app: shared theme (`theme.ts`, `rtl-cache.ts`), shared Logo component, shared tooling (`.claude/skills`, eslint/vite/tsconfig)
- [x] GitHub repo created and pushed: `marklevi7/alfi-teachers` (public, branch `main`)
- [x] Primary color = green (`greenTheme`, same GREEN[700] a11y shade as the student app's v7) — confirmed by Mark, not deepPurple
- [x] Sidebar chrome built: real "אלפי למורה" wordmark (full width, under it the class dropdown — standard MUI `TextField select`), nav list matching the student app's actual selected-state pattern (tinted bg + `primary.dark`, not a solid fill), logout as a nav-list row, dev control bar (device toggle) same mechanism as the student app
- [x] מסך ראשי built from the test_staff wireframe (current/old system) — **superseded by item 1 above, not yet rebuilt**

## Standing rules

- MUI v5.14 canonical only — no raw hex, no invented tokens
- RTL-first, Hebrew-first
- Default to the student ALFI app's actual patterns first, then MUI, then any wireframe — a wireframe is a rough guide, not a spec to override the real system
- Never invent product content — ask Mark (see `app/CLAUDE.md` Rule 0)

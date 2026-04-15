# Design Canvas MVP — Plan

Task breakdown for MVP implementation. Follows `WORKFLOW.md` (plan → small steps → self-review → completion summary). Architecture locked in [technical-approach.md](technical-approach.md); product scope locked in [product.md](product.md).

---

## Load-Bearing Constraint (carried forward)

**Composition state must be JSON-serializable at all times.** No functions, DOM refs, React elements in state. Planning honors this by placing all state shape decisions under a single module boundary (see Milestone 2) that never imports React.

---

## Dependencies to Add

| Package | Purpose | Justification |
|---|---|---|
| `@dnd-kit/core` | Drag primitives | Approach recommendation |
| `@dnd-kit/sortable` | Nested sortable | Approach recommendation |
| `@dnd-kit/utilities` | DnD helpers | Approach recommendation |
| `immer` | Immutable tree updates | Keeps state module pure + serializable |
| `nanoid` | Stable node ids | Small, tree-shakeable |
| `prettier` + standalone build + ts parser | In-browser `.tsx` formatting | Export quality |

No backend, no AI SDK, no state-management library (React state + context is sufficient at MVP scale).

---

## Milestone Sequence

Each milestone = one branch = one PR. Merge to `main` only when green and the milestone's Definition of Done is met. Working deployable state at all times.

### M1 · Scaffold cleanup & layout shell
**Branch:** `feature/m1-layout-shell`
**Goal:** Replace the demo App with the three-pane canvas shell (panel · canvas · inspector).
**Includes:** Remove Vite demo UI; add layout shell with placeholder panes; add route for `/canvas`; wire DS stylesheet import confirmation.
**DoD:** App boots, shows three empty panes, DS styles applied.
**Risk:** Low. **Rollback:** `git revert`.

### M2 · Composition state module (the load-bearing boundary)
**Branch:** `feature/m2-composition-state`
**Goal:** Pure, React-free module that owns the JSON tree + mutations. This is where the constraint is enforced.
**Includes:**
- `src/composition/` module with zero React imports.
- Tree type, id generation, mutations (insert, move, remove, updateProps, rename), traversal helpers.
- Immer-based update API.
- Round-trip `JSON.stringify`/`JSON.parse` test.
- ESLint boundary rule: `src/composition/` may not import from `react` or `src/canvas/`.
**DoD:** Module builds, round-trip test passes, lint boundary enforced.
**Risk:** If this boundary is soft, Model A becomes a dead end. **Mitigation:** lint rule + explicit test.

### M3 · Component catalog (Tier 1 + Tier 2)
**Branch:** `feature/m3-catalog`
**Goal:** Hand-authored catalog of ~45 DS components with prop schemas and slot rules.
**Includes:**
- `src/catalog/` module (also React-free — it's data).
- Catalog entry type (name, category, tier, acceptsChildren, childSlots, defaultProps, propSchema).
- Prop schema kinds: `string`, `number`, `enum`, `boolean`. Props that don't fit (e.g. `ReactNode` icons) are hidden in MVP.
- Tier 1: ~30 passthrough components.
- Tier 2: ~15 compound components with slot rules (Card family, Tabs, Accordion, etc.).
**DoD:** Catalog data validates against its type; unit test confirms every entry's `defaultProps` satisfies its `propSchema`.
**Risk:** Catalog drift with DS updates. **Mitigation:** lock DS version; revisit on upgrade.

### M4 · Component panel (drag source)
**Branch:** `feature/m4-component-panel`
**Goal:** Browsable left pane rendering the catalog; components are drag sources.
**Includes:** Category grouping, search, drag-source wiring via dnd-kit.
**DoD:** Every catalog entry visible; dragging produces a drag overlay.
**Risk:** Low.

### M5 · Canvas renderer + per-component error boundaries
**Branch:** `feature/m5-canvas-render`
**Goal:** Center pane renders the composition tree as live DS components. Every DS component wrapped in an error boundary.
**Includes:**
- Tree walker that maps node → DS component via catalog.
- `ComponentErrorBoundary` wrapping each rendered node.
- Slot-aware rendering for compound components.
- Empty-canvas affordance.
- **Edit-mode event interceptor:** click / drag events on the canvas target the node, not the component's own handlers.
**DoD:** Render a hand-seeded login tree; Button click selects (doesn't submit); intentionally breaking one component shows an error boundary, not a canvas crash.
**Risk:** Edit-mode interception may conflict with DS component internals. **Mitigation:** test with Button, Input, and compound (Card) before expanding.

### M6 · Drop-to-add + nest + reorder
**Branch:** `feature/m6-canvas-dnd`
**Goal:** Full drag-and-drop from panel onto canvas, onto containers, between siblings.
**Includes:** `useDroppable` on canvas root, containers, and between-sibling gaps; state mutations via M2's module; slot rule enforcement (Card Header → Content → Footer order).
**DoD:** Login flow via drag: drop Card, drop 2 Inputs inside, drop Button inside.
**Risk:** Nested dnd-kit setup. **Mitigation:** start with flat drop; add nesting; add between-gaps last.

### M7 · Property editor (inspector pane)
**Branch:** `feature/m7-inspector`
**Goal:** Right pane shows schema-driven form for the selected node.
**Includes:** Selection state; four field renderers (text input, number input, select, switch); updates routed through M2.
**DoD:** Select Input → change `type` to `password` via enum → reflected live in canvas.
**Risk:** Low.

### M8 · Composition naming + named-list persistence
**Branch:** `feature/m8-persistence`
**Goal:** Multiple named compositions; localStorage-backed; switch between them.
**Includes:**
- `CompositionMeta` (id, name, updatedAt); list stored under one key.
- Header UI: current composition name (editable), new / rename / delete / switch.
- Auto-save on every mutation (debounced).
- Boot: reopen last-edited composition.
**DoD:** Create "LoginPage", edit, refresh, still there. Create second composition, switch, no cross-contamination.
**Risk:** localStorage write thrash. **Mitigation:** debounce writes.

### M9 · Export to `.tsx`
**Branch:** `feature/m9-export`
**Goal:** Emit a standalone `.tsx` file that compiles and renders against the DS.
**Includes:**
- Tree → JSX string traversal.
- Auto-compute imports from catalog.
- Wrap in `export function {name}() { return <...>; }`.
- Format with `prettier/standalone`.
- "Copy to clipboard" + "Download `.tsx`" actions.
**DoD:** Export login composition; drop the file into a fresh React app with `@david-richard/ds-blossom` installed; it compiles and renders identically.
**Risk:** Prop serialization edge cases (enum strings vs raw values; booleans as attribute flags). **Mitigation:** unit tests per prop kind.

### M9.5 · Layout primitives (Row, Stack, ButtonGroup)
`feature/m9-5-layout-primitives` — Side-by-side composition. Stacking children vertically is the natural behavior of container divs; horizontal arrangement needs an explicit primitive.

- **Row** and **Stack** — our own layout primitives. Emit as `<div className="flex gap-3">…</div>` and `<div className="flex flex-col gap-3">…</div>`. Not DS components; structural markup the designer assembles between DS components. `gap` prop is an enum (sm/md/lg). This matches the mental model every designer has from Figma / Subframe / Framer.
- **ButtonGroup** — DS primitive, already exported by `@david-richard/ds-blossom`. Add as a catalog Tier 2 entry with seeded Button children. Idiomatic DS code for grouped buttons (shared border, keyboard nav).

Design rationale:
- B + A from the Approach pass. Row/Stack cover the general case; ButtonGroup surfaces the DS's own opinion about button grouping.
- Option C (layout prop on existing containers) rejected — muddies DS semantics, produces `className="flex"` smells on DS components in the export.

**DoD:** E2E — drop Row into CardContent, drop two Buttons into Row, they render side-by-side. Export contains `<div className="flex gap-3">` wrapping the Buttons.

**Risk:** Low. Pure additions. The emitter already handles container components; Row/Stack plug into the same path.

---

### M10 · End-to-end demo dress rehearsal
**Branch:** `feature/m10-demo-polish`
**Goal:** Run the scripted login demo start-to-finish; fix whatever feels wrong.
**Includes:** Polish pass on drag affordances, selection outline, error states, empty state copy.
**DoD:** The 7-step login demo from `product.md` runs clean in under 3 minutes, no manual recovery.

---

## Verification Plan

All verification is automated. No manual smoke testing.

**Tooling (added in M1):**
- **Vitest** + `@testing-library/react` + jsdom — unit/integration tests
- **Playwright** — end-to-end tests (enabled from M5 onward)
- **GitHub Actions** — runs `build`, `lint`, `test`, `test:e2e` on every PR; PRs do not merge unless green

**Per-milestone:**
- M2: unit test — `JSON.stringify/parse` round-trip preserves tree; mutation API purity
- M3: unit test — every catalog entry's `defaultProps` validates against its `propSchema`
- M5: E2E — seeded tree renders; intentional error shows boundary; canvas survives
- M6: E2E — drag panel item onto canvas; drag to reorder; drag to nest
- M7: E2E — select node, change enum prop, live update in canvas
- M8: E2E — create composition, edit, reload, state persists
- M9: unit test — serialized output matches golden fixture; imports correctly computed. Plus: **external compile test** — exported `.tsx` is compiled in a tiny sandbox fixture repo with installed DS; compile failure fails the PR.
- M10: E2E — full login demo script runs end-to-end

**Export correctness is the thesis.** The external-compile test at M9 is non-negotiable.

## Merge Policy (for this project)

- **Auto-merge when green** for mechanical milestones: M1, M3, M4, M5, M6, M7, M8.
- **User review required** before merge for thesis-critical milestones: **M2** (load-bearing state module), **M9** (export), **M10** (demo polish).
- All PRs: self-review as Security + Regression Reviewer before marking ready.

## Pre-Approved Dependencies

The following deps may be added without per-PR permission (per `WORKFLOW.md` batched permissions):

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `immer`, `nanoid`
- `prettier` (runtime), `prettier` standalone + ts parser
- Dev: `vitest`, `@testing-library/react`, `jsdom`, `@playwright/test`

Any other new dep → stop and ask.

---

## Rollback Plan

Each milestone is a single PR, squash-merged. Rollback = revert the squash commit. Because the composition state module (M2) is pure data, `localStorage` contents survive milestone reverts as long as the tree shape hasn't changed. Tree-shape changes (rare) require a schema version bump + migration or a localStorage wipe.

---

## Out of Scope (MVP)

Per `product.md`: AI, Tier 3 components, fidelity modes, dark mode, undo/redo, multi-select, responsive preview, multi-page, backend, file-based save, accessibility audit beyond defaults. Each has a home in v0.5 or v1.0.

---

## Resolved Items

- **Product name in UI:** "Design Canvas"
- **Deploy target:** localhost only for POC; user will wire Vercel via Git post-merge
- **Catalog curation:** AI judgment; no pre-review required
- **Merge policy:** auto-merge on green for M1/M3/M4/M5/M6/M7/M8; user review for M2/M9/M10
- **E2E tool:** Playwright from M5

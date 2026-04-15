# Design Canvas POC — Approach

> Output of the Approach phase per `APPROACH.md`. This doc explores option space before planning. It is **not** a task breakdown or file-level design.

---

## 1. Problem Restatement

**What is broken today:** The designer→engineer handoff is a translation layer. Figma produces pictures; engineers rebuild from pictures in code. This introduces drift, duplicates effort, and scales linearly with team size.

**What we are trying to achieve:** A tool where the artifact the designer manipulates **is** the production artifact. A designer composes real React components from a published DS package; the export is a `.tsx` file that compiles and renders unchanged.

**Key constraints:**
- POC scope — prove the model, not production-grade
- Single-user, browser-only, no backend, no auth
- Must consume `@david-richard/ds-blossom` as an npm dependency (read-only)
- Must produce `.tsx` that compiles as-is against the DS package
- Architecture should be sound enough to evolve (MVP → v0.5 → v1.0)
- Designer-first UX: hands-on-the-legos before any AI

---

## 2. Jobs To Be Done (JTBD)

Six jobs a designer hires this tool for, across the design lifecycle:

### J1 — Compose a screen from real blocks
- **Trigger:** Designer has a screen to build and wants to avoid Figma's fake components.
- **Success:** A screen assembled entirely from DS components, rendering as real production UI.
- **Current alternative:** Figma with DS-mimicking symbols — looks right, diverges from code, can't be exported to real code.

### J2 — Explore structure at low fidelity
- **Trigger:** Early ideation. Polish distracts from structural decisions.
- **Success:** Same composition renders as a wireframe — no color, no polish — so layout/hierarchy is the only variable.
- **Current alternative:** Separate wireframe tools (Whimsical, Balsamiq) that don't share vocabulary with hi-fi.

### J3 — Iterate on a composition
- **Trigger:** Stakeholder feedback, design review, refinement pass.
- **Success:** Reopen the saved composition, rearrange, swap variants, reshow — without rebuilding.
- **Current alternative:** Edit the Figma file, re-export specs, wait for engineer to rebuild.

### J4 — Try variants without combinatorial pain
- **Trigger:** "What if the button were destructive?" / "What if this were a Sheet instead of a Dialog?"
- **Success:** Select component → change variant dropdown → see the real result.
- **Current alternative:** Duplicate Figma frames, manually restyle each.

### J5 — Show stakeholders something real
- **Trigger:** Review meeting. Need something that feels like the product, not a mockup.
- **Success:** Canvas renders identically to the shipped product because they're the same components.
- **Current alternative:** Hi-fi Figma prototype — looks real, isn't real, can't click through to real behavior.

### J6 — Hand off to engineering with zero translation
- **Trigger:** Design is signed off, engineer needs to implement.
- **Success:** Engineer opens the exported `.tsx`, it imports from `@david-richard/ds-blossom`, compiles, and renders. They add state/hooks/data — never restructure.
- **Current alternative:** Engineer reads a Figma spec, rebuilds from scratch, introduces drift.

**JTBD priority for MVP:** J1, J2, J4, J6. These are the thesis. J3 requires persistence; J5 requires polish. Both land in v0.5.

---

## 3. User Stories (MVP)

- As a designer, I want to **see every available DS component in a browsable panel** so I know what blocks I have.
- As a designer, I want to **drag a component onto a canvas** so I can start composing without writing code.
- As a designer, I want to **nest components inside containers** (Card → Input) so I can build real hierarchy.
- As a designer, I want to **edit props via a form** (variant, size, placeholder, label) so I can configure without memorizing APIs.
- As a designer, I want to **rearrange components by dragging** so I can iterate on layout.
- As a designer, I want to **toggle fidelity** (lo-fi / mid-fi / hi-fi) so I can focus on structure or polish depending on stage.
- As a designer, I want to **export a `.tsx` file** so the engineer can use my work directly.
- As a designer, I want my work **persisted in the browser** so I don't lose it on refresh.

---

## 4. Fidelity Modes

Three theme layers, same component tree:

| Mode | Visual | Use |
|---|---|---|
| **Lo-fi** | No color, grayscale-only, dashed borders, monospace type, flat backgrounds | Structural exploration, wireframing |
| **Mid-fi** | Real layout, real type hierarchy, neutral gray palette, solid borders | Flow and spatial decisions |
| **Hi-fi** | Full DS tokens, brand colors, production type, shadows, animations | Stakeholder review, handoff preview |

**Implementation posture:** Author three CSS variable sets in this repo, scoped by class (`.fidelity-lo`, `.fidelity-mid`, `.fidelity-hi`) on a canvas wrapper. Each set overrides the DS's `:root` variables for that subtree. Hi-fi is the DS default (no overrides). Lo-fi and Mid-fi are authored by us.

**Critical:** Fidelity switching is a theme toggle, not a component swap. The JSON tree is invariant across fidelity modes.

---

## 5. Roadmap

### MVP (v0.1) — "Prove the lego model"

**Thesis:** A designer can compose real production components visually and export production code. No AI, no magic.

**Included:**
- Component panel (curated catalog of ~10–15 DS components)
- Canvas with containers-with-slots layout model
- Drag to add, drag to rearrange, drag to nest
- Property editor (auto-rendered form from component schema)
- Three fidelity modes via class-based theme switching
- Export to single `.tsx` file with imports + named function component
- localStorage persistence of the JSON tree

**JTBD addressed:** J1, J2, J4, J6

**Deferred:** AI generation, multi-page flows, undo/redo beyond trivial, collaboration, backend, auth, custom component authoring, responsive preview

**Definition of done:** The scripted demo runs end-to-end — browse → drag Card → nest Inputs → nest Button → toggle lo-fi→hi-fi → Export → the exported `.tsx` compiles and renders identically against the DS.

---

### v0.5 — "Useful for real work"

**Thesis:** A designer can do actual concepting work in this tool without hitting frustrating walls.

**Included:**
- AI as an **alternative input** — a prompt box that generates a subtree and drops it on the canvas; designer then manipulates manually. AI is a starting point, not the workflow.
- AI constrained to DS vocabulary via auto-derived system prompt from `.d.ts`
- Undo/redo history
- Multi-selection and bulk operations
- Component duplication
- Keyboard shortcuts
- Better property editor (grouped props, validation, enum pickers with previews)
- Minimal proxy for AI API key (replace client-side `VITE_ANTHROPIC_API_KEY` with server-held key + rate limit)

**JTBD addressed:** + J3, J5

**Deferred:** Multi-page, collaboration, file-based persistence

**Definition of done:** A designer can open this tool cold, describe or build a 15-component screen, iterate on it for 30 minutes, export, and the engineer ships it unchanged.

---

### v1.0 — "Complete design-to-code workflow"

**Included:**
- Multi-page projects with shared navigation and layout
- Named slots and composable layout frames (HeaderSlot, SidebarSlot)
- File-based save/load (project as a directory)
- Export pipeline generates a small app scaffold (router, pages, shared layout) not just single screens
- Responsive preview (breakpoints visible on canvas)
- Component variant galleries (preview every variant inline)
- Comment/annotation layer for stakeholder review
- Optional backend (Supabase) for sharing and collaboration

**Deferred beyond v1.0:** Real-time multi-cursor collaboration, custom component authoring in-tool, plugin system.

---

## 6. Technical Approach (Options + Tradeoffs)

Decisions where the brief left room. Each has a recommendation.

### 6a. Drag-and-drop library

| Option | Pros | Cons |
|---|---|---|
| **dnd-kit** | Modern, accessible, good for nested/sortable lists, React-first, excellent docs | Slightly opinionated; sortable-tree requires some assembly |
| react-dnd | Mature, flexible, well-known | HTML5 backend is clunky, less active maintenance, heavier API |
| Native HTML5 DnD | Zero deps | Poor UX on nested drops, inconsistent across browsers |

**Recommendation:** dnd-kit. The containers-with-slots model maps cleanly to its `useDroppable` + `useSortable` primitives. Zero-dep native is a false economy here — we'd rebuild half of dnd-kit.

### 6b. Component tree state model

| Option | Pros | Cons |
|---|---|---|
| **Nested JSON tree** (children: []) | Mirrors React tree 1:1, easy to serialize, easy to export | Deep updates require immer or careful spreading |
| Flat normalized (by id, with parentId) | Fast lookups, easy partial updates | Requires denormalize step to render and export |

**Recommendation:** Nested JSON tree with `immer` for updates. We're rendering the tree anyway, and export is a direct traversal. Normalize later if performance demands it (unlikely at POC scale).

### 6c. Component catalog (what goes in the panel, what props are editable)

| Option | Pros | Cons |
|---|---|---|
| **Hand-authored catalog** (TS file describing each component + prop schema) | Controlled, predictable, allows curation (e.g., hide `className` in UI), supports UX metadata (category, icon, slot rules) | Must be maintained as DS evolves |
| Auto-derived from `.d.ts` | Always in sync | `react-docgen` on `.d.ts` is noisy; CVA variants aren't machine-introspectable without AST work; no metadata (category, slots) |

**Recommendation:** Hand-authored catalog for MVP. Keep it small (~15 components). Auto-derivation is a v0.5+ investment once the schema shape is proven.

### 6d. Property editor rendering

| Option | Pros | Cons |
|---|---|---|
| **Schema-driven auto form** (render from catalog's prop definitions) | Consistent, DS-agnostic, easy to extend | Less bespoke per component |
| Per-component hand-written editors | Pixel-perfect UX per component | 15× the code, painful to maintain |

**Recommendation:** Schema-driven. Ship a small set of field renderers (text, number, enum, boolean) that covers ~90% of DS props.

### 6e. Export strategy

| Option | Pros | Cons |
|---|---|---|
| **Direct string templating** (traverse tree, emit JSX) | Simple, debuggable, predictable output, easy to format with Prettier | Fragile for complex expressions (icons, callbacks) |
| AST builder (babel/ts-morph) | Structurally sound, handles edge cases | Overkill for POC; heavy deps; slower |

**Recommendation:** String templating + Prettier. For MVP, prop values are primitives + enum strings — no callbacks or JSX-valued props. AST route is a v1.0 concern when we support richer prop types.

### 6f. AI key handling (v0.5)

**Recommendation:** Start with client-side `VITE_ANTHROPIC_API_KEY` (per user direction — POC, not shippable). Add a minimal Vercel/Cloudflare edge proxy in late v0.5 before any public demo. Note this in `SECURITY.md` as a known POC-only exception.

---

## 7. Provisional Recommendation (Summary)

Build MVP as: **Vite/React/TS + dnd-kit + nested JSON tree with immer + hand-authored catalog of ~15 components + schema-driven property editor + string-templated export + three fidelity modes via scoped CSS variables + localStorage persistence.** No AI. No backend.

This is the smallest architecture that proves the thesis and can evolve toward v0.5 without rewrites.

---

## 8. Open Questions (Need Resolution Before Planning)

1. **Catalog scope for MVP:** Which ~15 components are in the starter catalog? Suggested: Button, Input, Label, Card (+ subcomponents), Select, Checkbox, Textarea, Separator, Badge, Alert, Tabs. Does this match what the demo needs?
2. **Demo target commitment:** The login-page demo script — is that the single scenario we treat as the Definition of Done for MVP, or are there others?
3. **Lo-fi and Mid-fi aesthetic:** Do you have a reference for what lo-fi should look like? ("Wireframe aesthetic" is open-ended — Balsamiq-style? Sketchy borders? Pure monochrome grid?)
4. **Export shape:** Does the exported file default to a named function like `export function LoginPage() { ... }`, or is the component name user-editable per composition?
5. **Persistence granularity:** One composition at a time (overwrites on save), or a list of named compositions in localStorage?

---

## 9. Exit Criteria

This Approach is complete when:
- The MVP scope is locked (section 5 confirmed)
- The recommendations in section 6 are accepted or contested
- Open questions in section 8 are resolved

Once locked, we proceed to Planning — a task breakdown with branches, milestones, and implementation order.

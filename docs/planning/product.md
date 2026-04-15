# Design Canvas — Product Brief

The **what** and **why**. Read this if you want to understand what we're building and who it's for. No tech decisions here — those live in [technical-approach.md](technical-approach.md).

---

## Problem

The designer→engineer handoff is a translation layer. Figma produces pictures; engineers rebuild from pictures in code. This introduces drift, duplicates effort, and scales linearly with team size.

## Thesis

The artifact the designer manipulates should **be** the production artifact. A designer composes real React components from a published DS package; the export is a `.tsx` file that compiles and renders unchanged.

## Who It's For

- **Primary:** A designer who thinks visually but wants their output to be real code, not a picture of code. They understand components, props, and variants. They want to compose without opening an IDE.
- **Secondary (v0.5+):** An AI agent that generates and modifies compositions from natural language, constrained to the DS vocabulary.
- **Downstream:** An engineer who receives an exported `.tsx` file, immediately understands the structure, and adds state/hooks/data without restructuring.

---

## Jobs To Be Done

### J1 — Compose a screen from real blocks
**Trigger:** Designer has a screen to build and wants to avoid Figma's fake components.
**Success:** A screen assembled entirely from DS components, rendering as real production UI.
**Current alternative:** Figma with DS-mimicking symbols — looks right, diverges from code, can't be exported to real code.

### J2 — Iterate on a composition
**Trigger:** Stakeholder feedback, design review, refinement pass.
**Success:** Reopen the saved composition, rearrange, swap variants, reshow — without rebuilding.
**Current alternative:** Edit the Figma file, re-export specs, wait for engineer to rebuild.

### J3 — Try variants without combinatorial pain
**Trigger:** "What if the button were destructive?" / "What if this were a Sheet instead of a Dialog?"
**Success:** Select component → change variant dropdown → see the real result.
**Current alternative:** Duplicate Figma frames, manually restyle each.

### J4 — Show stakeholders something real
**Trigger:** Review meeting. Need something that feels like the product, not a mockup.
**Success:** Canvas renders identically to the shipped product because they're the same components.
**Current alternative:** Hi-fi Figma prototype — looks real, isn't real, can't click through to real behavior.

### J5 — Hand off to engineering with zero translation
**Trigger:** Design is signed off, engineer needs to implement.
**Success:** Engineer opens the exported `.tsx`, it imports from `@david-richard/ds-blossom`, compiles, renders. They add state/hooks/data — never restructure.
**Current alternative:** Engineer reads a Figma spec, rebuilds from scratch, introduces drift.

**JTBD priority for MVP:** J1, J3, J5.

---

## User Stories (MVP)

- As a designer, I want to **see every available DS component in a browsable panel** so I know what blocks I have.
- As a designer, I want to **drag a component onto a canvas** so I can start composing without writing code.
- As a designer, I want to **nest components inside containers** (Card → Input) so I can build real hierarchy.
- As a designer, I want to **edit props via a form** (variant, size, placeholder, label) so I can configure without memorizing APIs.
- As a designer, I want to **rearrange components by dragging** so I can iterate on layout.
- As a designer, I want to **name my composition** so the exported file has a meaningful function name.
- As a designer, I want to **export a `.tsx` file** so the engineer can use my work directly.
- As a designer, I want my compositions **saved in the browser** as a named list so I can switch between them without losing work.

---

## Roadmap

### MVP (v0.1) — "Prove the lego model"

**Thesis:** A designer can compose real production components visually and export production code. No AI, no magic.

**Included:**
- Component panel: ~45 DS components (Tier 1 passthroughs + Tier 2 compound-but-composable)
- Canvas with containers-with-slots layout
- Drag to add, rearrange, and nest
- Property editor (auto-rendered form from component schema)
- Composition naming (drives export filename + function name)
- Named-list persistence in localStorage (new/rename/delete/switch)
- Export to single `.tsx` file with imports + named function component

**JTBD addressed:** J1, J3, J5

**Deferred:**
- AI generation
- Tier 3 stateful components (Dialog, Sheet, Popover, Dropdown, Select, Combobox, Command, Menubar, Carousel, Calendar, Sidebar, Drawer) — need a distinct "insert molecule" UX pattern
- Multi-page flows, undo/redo, collaboration, backend, auth, custom component authoring, responsive preview

**Definition of Done:** The **login-page demo** runs end-to-end:

1. Designer browses the component panel, sees real DS components.
2. Drags a Card onto the canvas — renders as a real component.
3. Drags two Inputs inside the Card, sets one to `type="password"`.
4. Drags a Button inside, sets `variant="primary"`, types "Sign In".
5. Names the composition "LoginPage".
6. Clicks Export → gets a clean `LoginPage.tsx` file.
7. Opens the file — it imports from `@david-richard/ds-blossom`, compiles, renders.

---

### v0.5 — "Useful for real work"

**Thesis:** A designer can do actual concepting work in this tool without hitting frustrating walls.

**Included:**
- AI as an **alternative input** — a prompt box generates a subtree and drops it on the canvas; designer refines manually. AI is a starting point, not the workflow.
- AI constrained to DS vocabulary via auto-derived system prompt
- Tier 3 stateful components (insert-as-molecule pattern)
- Undo/redo history
- Multi-selection, duplication, keyboard shortcuts
- Grouped property editor with enum previews
- Minimal proxy for AI API key (replace client-side env var)

**JTBD addressed:** + J2, J4

**Deferred:** Multi-page, collaboration, file-based persistence

**Definition of Done:** A designer can open this tool cold, describe or build a 15-component screen, iterate on it for 30 minutes, export, and the engineer ships it unchanged.

---

### v1.0 — "Complete design-to-code workflow"

**Included:**
- Multi-page projects with shared navigation and layout
- Named slots and composable layout frames (HeaderSlot, SidebarSlot)
- File-based save/load (project as a directory)
- Export pipeline generates a small app scaffold (router, pages, shared layout)
- Responsive preview (breakpoints visible on canvas)
- Component variant galleries (preview every variant inline)
- Comment/annotation layer for stakeholder review
- Optional backend for sharing and collaboration

**Deferred beyond v1.0:** Real-time multi-cursor collaboration, custom component authoring in-tool, plugin system.

---

## Open Product Questions

All MVP product decisions are resolved. See [technical-approach.md](technical-approach.md) for the remaining technical decisions.

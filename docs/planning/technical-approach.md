# Design Canvas — Technical Approach (MVP)

Output of the Approach phase per the root `APPROACH.md` methodology: evaluation of **meaningfully different architectural models** for how the canvas works, judged against the JTBD. No file-level design, no schemas, no code. Those belong to Planning.

Product context: [product.md](product.md).

---

## 1. Problem Restatement

A designer needs to compose real production React components into screens and export the result as a `.tsx` file that compiles and renders unchanged. The MVP must deliver **J1** (compose from real blocks), **J3** (try variants without combinatorial pain), and **J5** (hand off with zero translation). The tool must be evolvable toward AI generation (v0.5) and multi-page workflows (v1.0).

The architectural question is: **what does the designer actually manipulate, and what is the source of truth?** Different answers produce fundamentally different tools with the same surface description.

---

## 2. Three Architectural Models

### Model A — Live React Canvas

**The designer manipulates a live React tree.** The canvas is a React application rendering DS components in real time. Dragging and dropping modifies an in-memory composition state; React re-renders the preview. Export serializes that state to `.tsx`.

- **Source of truth:** In-memory composition state, owned by the canvas app.
- **Preview:** The real components rendered directly inside the canvas React tree.
- **Export:** Serialize state → string template → file.
- **Reference points:** Builder.io, Plasmic's visual editor core.

**Strengths against JTBD**
- **J1 (compose from real blocks):** Strongest of the three. The designer sees *the actual component*, not a proxy.
- **J3 (variants without combinatorial pain):** Changing a prop is literally just changing the prop on a live element — zero indirection.
- **J5 (zero-translation handoff):** Serialization is direct since the state already mirrors a React tree.

**Weaknesses**
- Canvas chrome and user composition share a React runtime. CSS bleed, prop-name collisions, and errors in a DS component can crash the canvas. Needs error boundaries.
- Drag interactions must coexist with the components' own interactive behavior (Button clicks, Input focus). Requires an "edit mode" overlay that intercepts events.
- Components that manage their own open/close state (Tier 3: Dialog, Popover) are awkward — their natural UX fights the canvas.

**Evolvability**
- AI (v0.5): Clean — AI outputs composition state, canvas renders.
- Multi-page (v1.0): Straightforward — multiple trees in one state store.
- Custom components (post-v1.0): Hard — would require dynamic import and trust boundary.

---

### Model B — Iframe Sandbox

**The designer manipulates components that live inside an isolated iframe.** The canvas chrome (panel, property editor, toolbar) is the parent app. The preview is an iframe loading a minimal harness that imports the DS and renders whatever composition the parent tells it to render via `postMessage`. Export is computed from the same composition state the parent holds.

- **Source of truth:** Composition state in the parent; the iframe is a pure render target.
- **Preview:** DS components rendered inside an isolated document.
- **Export:** Same serialization as Model A, driven from parent state.
- **Reference points:** Storybook (preview iframe), Playroom, Framer's preview.

**Strengths against JTBD**
- **J1:** Equal to A — designer still sees real components.
- **J3:** Equal to A — prop changes are messaged to the iframe and re-rendered.
- **J4 (show stakeholders something real, v0.5):** Stronger than A — the iframe renders components without canvas chrome leaking in. Previewable as-is.
- **Isolation:** Canvas chrome can't crash from a misbehaving DS component. Cleaner tenancy boundary. Tier 3 stateful components can behave naturally inside their own document.

**Weaknesses**
- More machinery for MVP: postMessage protocol, parent↔iframe sync, double React runtime (memory cost), reload/hydrate logic.
- Drag-and-drop across the iframe boundary is harder — dnd-kit doesn't naturally cross frames. Either drag in the parent and commit to the iframe, or mirror DOM geometry. Both add complexity.
- Styling: the iframe needs its own copy of Tailwind + DS CSS. Manageable but non-trivial.

**Evolvability**
- AI (v0.5): Clean.
- Multi-page (v1.0): Strong — each page is just a different document to render.
- Stakeholder preview mode: Near-free. The iframe *is* the preview.
- Custom components: Moderate — iframe is a natural trust boundary.

---

### Model C — Document-First (Code-is-the-Artifact)

**The designer manipulates an abstract composition document; React is a render layer on top.** The canvas holds a neutral tree description (not React elements). A renderer walks the tree to produce a preview. The *same* tree is walked to produce the export. The tree has no dependency on React's runtime.

- **Source of truth:** The composition document (think: a lightweight, React-agnostic AST).
- **Preview:** A renderer translates the document to React elements on the fly.
- **Export:** A second translator emits `.tsx` from the same document. The renderer and exporter are siblings.
- **Reference points:** Framer's canvas model, Figma's node graph, Craft.js with a stricter separation.

**Strengths against JTBD**
- **J5 (zero-translation handoff):** Strongest of the three. Export is a first-class operation with the same status as preview, not a serialization of UI state. Produces the cleanest code.
- **Portability:** The document is the product. Could one day render to React Native, Vue, raw HTML, or a spec file for AI — without touching authoring UX.
- **AI alignment (v0.5):** AI emits documents, not React. The AI surface is the same shape as the tool's surface.
- **Debuggability:** The document is inspectable and diffable as data. Bug in export? Look at the document, not a live tree.

**Weaknesses**
- **Highest initial cost.** Two translators (render, export) must stay in sync for every component added to the catalog. At ~45 components, that's a tax every time.
- **J1 cognitive distance:** The designer still sees real components, but the system has a layer of indirection. If the translator has a bug, preview and export diverge — worse than Model A where they can't.
- **Over-engineered for MVP.** The document-first payoff comes at scale (multi-target export, AI, custom components). For "prove a designer can compose a login page," it's architecture tax paid up front.

**Evolvability**
- AI (v0.5): Strongest.
- Multi-page: Strong.
- Multi-target export (v1.0+): Only model that makes this easy.
- Custom components: Strong — document shape is extensible.

---

## 3. Evaluation Against Values

| | Model A (Live) | Model B (Iframe) | Model C (Document) |
|---|---|---|---|
| Time to working MVP | **Fastest** | Medium | Slowest |
| J1 fidelity | Highest | Highest | High (indirect) |
| J3 cost | Lowest | Low | Medium |
| J5 output quality | High | High | **Highest** |
| Isolation & safety | Weakest | **Strongest** | Medium |
| AI alignment (v0.5) | Good | Good | **Best** |
| Stakeholder preview (v0.5) | Okay | **Best** | Good |
| Future multi-target (v1.0+) | Hard | Medium | **Easy** |
| Risk of architectural rewrite later | Medium *(conditional — see §5)* | Low | Lowest |

---

## 4. Provisional Recommendation

**Model A — Live React Canvas — for MVP.**

Rationale:
- The thesis to prove is "a designer can compose real production components and export production code." Model A is the most direct path to that proof. Every architectural layer we add before proving the thesis is a layer we might learn we didn't need.
- At MVP scale (~45 components, single-page, no AI), Model A's weaknesses are manageable with a scoped edit-mode event interceptor and React error boundaries.
- Model A's export pipeline is the *same* pipeline Model C would need for export; we're not throwing away work by starting here.
- Tier 3 stateful components (the one place Model A struggles) are already deferred to v0.5 on product grounds.

**Why not Model B:** The iframe isolation is valuable but premature. The problems it solves (chrome/component crosstalk, stakeholder preview) are real but either solvable in Model A with error boundaries, or belong to v0.5 where we'd reassess anyway. The iframe tax is highest on drag-and-drop — exactly the interaction the MVP lives or dies on.

**Why not Model C:** The right long-term answer, probably. But the MVP is the wrong time to pay its tax. Committing to a neutral document format before we've learned what compositions actually look like in practice risks designing the wrong document. **Mitigation:** Build Model A with a clean separation between "composition state" and "React rendering" so we can extract a neutral document later with low friction. Treat Model C as the v1.0 migration target once the JTBD have been validated.

---

## 5. Load-Bearing Architectural Constraint

**Composition state must remain cleanly separable from React rendering at all times.**

This is the single mitigation that keeps Model A from becoming a dead end. The natural gravity of Model A is entanglement — putting React refs, event handlers, or render-derived data inside composition state "just for now." If that discipline slips during implementation:

- The state object stops being portable data and becomes React-coupled.
- The Model C migration cost jumps from medium to high.
- Export correctness becomes dependent on render-time behavior rather than state alone.

**Enforcement rule (to be carried into Planning):** composition state must be JSON-serializable at all times. No function references, no DOM nodes, no React elements, no refs. If it can't be `JSON.stringify`'d and `JSON.parse`'d round-trip without loss, it doesn't belong in composition state.

The "Medium" rewrite-risk rating in §3 is **conditional on this constraint holding.** If it slips, the rating becomes High.

---

## 6. Accepted Tradeoffs

- Canvas and user composition share a React runtime. We accept potential CSS/JS bleed and handle it with **per-component error boundaries** (every rendered DS component wrapped individually) plus scoped styles. One broken component shows an error state; the rest of the canvas keeps working.
- Tier 3 stateful components are deferred. When they return in v0.5, we may revisit this decision.
- Moving to Model C later is possible but conditional on §5 being honored.

---

## 7. Resolved Decisions

1. **Architecture:** Model A for MVP, with Model C as the stated long-term target (v1.0).
2. **Error boundary depth:** Every rendered DS component wrapped individually. Performance cost is negligible at POC scale; a full-canvas crash during a demo is the worst possible outcome.
3. **AI evolvability weight:** **Low** for MVP. The whole point of resequencing AI to v0.5 was to validate manual composition first. Model A is sufficient for v0.5 AI — the AI generates composition state the same way a drag-drop action would. Model C's AI advantage only materializes at v1.0 scale.

---

## 8. Next: Planning

Approach is locked. Planning produces the task breakdown, branch sequence, dependency list, and schemas. That belongs in a separate doc — see `docs/planning/plan.md`.

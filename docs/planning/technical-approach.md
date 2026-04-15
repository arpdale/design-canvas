# Design Canvas — Technical Approach (MVP)

The **how**. Read this if you're implementing. Product context lives in [product.md](product.md).

This is the output of the Approach phase per the root `APPROACH.md` methodology: option evaluation with tradeoffs, not a task breakdown.

---

## Stack

- **Framework:** Vite + React + TypeScript (already scaffolded)
- **Styling:** Tailwind CSS v4 (already configured)
- **Design system:** `@david-richard/ds-blossom` v0.0.2 (already installed)
- **Target runtime:** Browser only; no backend in MVP

---

## Architecture Decisions

### 1. Drag-and-drop library

| Option | Pros | Cons |
|---|---|---|
| **dnd-kit** | Modern, accessible, React-first, good nested/sortable primitives, active maintenance | Slightly opinionated; sortable-tree requires assembly |
| react-dnd | Mature, well-known | HTML5 backend is clunky; less active; heavier API |
| Native HTML5 DnD | Zero deps | Poor UX on nested drops; browser inconsistencies |

**Decision:** **dnd-kit**. The containers-with-slots model maps cleanly to `useDroppable` + `useSortable`. Native DnD would force us to rebuild half of dnd-kit.

---

### 2. Component tree state model

| Option | Pros | Cons |
|---|---|---|
| **Nested JSON tree with `immer`** | Mirrors React tree 1:1, easy to serialize, easy to export, familiar | Deep updates require `immer` or careful spreading |
| Flat normalized (by id, with `parentId`) | Fast lookups, easy partial updates | Requires denormalize step to render and export |

**Decision:** **Nested JSON tree + immer**. We traverse the tree for render and for export anyway. Normalize later if performance demands it (unlikely at POC scale).

**Tree shape:**
```ts
type Node = {
  id: string;
  type: string;           // DS component export name
  props: Record<string, unknown>;
  children: Node[];       // empty if leaf or if component takes no children
  slot?: string;          // for compound components (e.g. "header" in Card)
};
```

---

### 3. Component catalog

| Option | Pros | Cons |
|---|---|---|
| **Hand-authored catalog** (TS file, one entry per component) | Controlled, curated, supports UX metadata (category, icon, slot rules, default props) | Must be maintained as DS evolves |
| Auto-derived from `.d.ts` | Always in sync | `react-docgen` output is noisy; CVA variants not introspectable without AST work; no UX metadata |

**Decision:** **Hand-authored catalog** for MVP. ~45 entries (Tier 1 + Tier 2). Auto-derivation is a v0.5+ investment once schema shape is proven.

**Catalog entry shape:**
```ts
type CatalogEntry = {
  name: string;                    // e.g. "Button"
  importFrom: "@david-richard/ds-blossom";
  category: "input" | "layout" | "display" | "feedback" | "nav";
  tier: 1 | 2 | 3;                 // 3 deferred in MVP
  acceptsChildren: boolean;
  childSlots?: { name: string; accepts: string[] }[];  // for compound
  defaultProps: Record<string, unknown>;
  propSchema: PropSchema[];        // drives property editor
};
```

**Component tiers (for scope clarity):**
- **Tier 1 — trivial passthroughs (~30):** Button, Input, Label, Textarea, Badge, Separator, Skeleton, Spinner, Avatar, Checkbox, Switch, Progress, etc. ~5 min/catalog entry.
- **Tier 2 — compound but composable (~15):** Card family, Alert, Tabs, Accordion, Breadcrumb, Field, InputGroup. Need slot rules. ~20 min each.
- **Tier 3 — stateful/controlled (~12) — DEFERRED to v0.5:** Dialog, Sheet, Drawer, Popover, Dropdown, Select, Combobox, Command, Menubar, Carousel, Calendar, Sidebar. Require a distinct "insert-as-molecule" UX and canvas-time open-state handling.

---

### 4. Property editor

| Option | Pros | Cons |
|---|---|---|
| **Schema-driven auto form** | Consistent, DS-agnostic, small code footprint | Less bespoke per component |
| Per-component hand-written editors | Pixel-perfect per component | ~45× the code; painful to maintain |

**Decision:** **Schema-driven**. Ship a small set of field renderers (text, number, enum-select, boolean-switch) that covers ~90% of DS props. Bespoke editors for edge cases as needed.

**PropSchema shape:**
```ts
type PropSchema =
  | { name: string; kind: "string"; label?: string; placeholder?: string }
  | { name: string; kind: "number"; label?: string; min?: number; max?: number }
  | { name: string; kind: "enum"; label?: string; values: string[] }
  | { name: string; kind: "boolean"; label?: string };
```

---

### 5. Export strategy

| Option | Pros | Cons |
|---|---|---|
| **Direct string templating + Prettier** | Simple, debuggable, predictable output | Fragile for complex expressions |
| AST builder (babel / ts-morph) | Structurally sound, handles edge cases | Overkill for POC; heavy deps; slower |

**Decision:** **String templating + `prettier`** (standalone browser build). MVP prop values are primitives + enum strings only — no callbacks or JSX-valued props. AST route becomes relevant at v1.0 when we support richer prop types.

**Export shape:**
```tsx
// {name}.tsx
import { Button, Card, CardContent, Input } from "@david-richard/ds-blossom";

export function {UserProvidedName}() {
  return (
    <Card>
      <CardContent>
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button variant="default">Sign In</Button>
      </CardContent>
    </Card>
  );
}
```

Component name is user-editable in the UI (defaults to "UntitledScreen"). Filename matches.

---

### 6. Persistence

**Decision:** **Named-list in localStorage**. Single key `design-canvas:compositions` holds an array of `{ id, name, tree, updatedAt }`. UI supports new / rename / delete / switch. Current composition id also persisted so a refresh reopens the last-edited one.

File-based save/load deferred to v1.0.

---

### 7. Styling / theming

**Decision:** **No fidelity modes in MVP**. The canvas renders DS components with their default (hi-fi) styling via `@david-richard/ds-blossom/styles.css`. Light mode only — no dark variant authored. Fidelity modes were considered and cut; they can be reintroduced later as scoped CSS variable overrides if needed.

---

## Dependencies (MVP)

New runtime deps to add:
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`
- `immer`
- `prettier` + `prettier/standalone` + `prettier/parser-typescript` (for in-browser formatting)
- `nanoid` (stable node ids)

No backend deps. No AI SDK in MVP.

---

## What's Explicitly Deferred

- AI integration (Anthropic SDK, system-prompt generation from DS types)
- Tier 3 stateful components
- Fidelity modes (lo-fi / mid-fi)
- Dark mode
- Undo/redo
- Multi-selection
- Responsive preview
- Multi-page projects
- Backend / proxy / auth
- File-based save

---

## Risks

- **DS prop coverage:** Some DS components may expose props that don't fit the four PropSchema kinds (e.g. `ReactNode` props for icons). Fallback: hide those props from the editor in MVP; use defaults.
- **Compound component children ordering:** Card expects Header → Content → Footer in that order. Catalog must encode slot order and the canvas must enforce it.
- **Export formatting cost:** `prettier/standalone` adds ~500KB to the bundle. Acceptable for POC; revisit for v1.0.

---

## Exit Criteria

Technical approach is accepted when:
- Each architecture decision (1–7) is confirmed or contested
- Dependency list is approved
- Deferred scope is understood and acceptable

Once locked, we proceed to Planning — a task breakdown with branches and implementation order.

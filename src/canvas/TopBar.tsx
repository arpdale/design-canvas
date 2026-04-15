import { useState } from 'react'
import { useCanvas } from './state/canvasStoreContext'

export function TopBar() {
  const {
    active,
    compositions,
    renameActive,
    createNew,
    deleteComposition,
    switchTo,
  } = useCanvas()

  // Keyed-by-composition-id trick: we re-mount this sub-component when the
  // active id changes, so its local state (nameDraft) is reset to the new
  // composition's name without needing a setState-in-effect.
  return (
    <header
      data-testid="topbar"
      className="h-12 shrink-0 border-b border-neutral-200 bg-white flex items-center gap-3 px-4"
    >
      <span className="font-semibold text-neutral-900">Design Canvas</span>

      {active ? (
        <>
          <span className="text-neutral-300">·</span>
          <CompositionNameInput
            key={active.id}
            initialName={active.name}
            onCommit={(name) => {
              if (name && name !== active.name) renameActive(name)
            }}
          />
        </>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        {compositions.length > 1 && active ? (
          <select
            data-testid="composition-switcher"
            aria-label="Switch composition"
            value={active.id}
            onChange={(e) => switchTo(e.target.value)}
            className="text-sm px-2 py-1 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
          >
            {compositions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : null}

        <button
          type="button"
          data-testid="composition-new"
          onClick={() => createNew()}
          className="text-sm px-2 py-1 rounded-md border border-neutral-200 hover:bg-neutral-50 focus:outline-none focus:border-neutral-400"
        >
          New
        </button>

        {active && compositions.length > 1 ? (
          <button
            type="button"
            data-testid="composition-delete"
            onClick={() => {
              if (confirm(`Delete "${active.name}"?`)) {
                deleteComposition(active.id)
              }
            }}
            className="text-sm px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 focus:outline-none focus:border-red-400"
          >
            Delete
          </button>
        ) : null}
      </div>
    </header>
  )
}

function CompositionNameInput({
  initialName,
  onCommit,
}: {
  initialName: string
  onCommit: (name: string) => void
}) {
  const [value, setValue] = useState(initialName)
  const commit = () => {
    const next = value.trim()
    if (next) onCommit(next)
    else setValue(initialName)
  }
  return (
    <input
      data-testid="composition-name"
      aria-label="Composition name"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') setValue(initialName)
      }}
      className="text-sm px-1.5 py-0.5 rounded border border-transparent hover:border-neutral-200 focus:outline-none focus:border-neutral-400 min-w-32"
    />
  )
}

import { useMemo, useState } from 'react'
import { panelEntries, type CatalogCategory, type CatalogEntry } from '../catalog'
import { ComponentTile } from './ComponentTile'

const CATEGORY_LABEL: Record<CatalogCategory, string> = {
  input: 'Input',
  layout: 'Layout',
  display: 'Display',
  feedback: 'Feedback',
  nav: 'Navigation',
  typography: 'Typography',
}

const CATEGORY_ORDER: CatalogCategory[] = [
  'layout',
  'input',
  'typography',
  'display',
  'feedback',
  'nav',
]

export function ComponentPanel() {
  const [query, setQuery] = useState('')

  const entries = useMemo(() => panelEntries(), [])

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const needle = query.toLowerCase()
    return entries.filter((e) =>
      (e.displayName ?? e.name).toLowerCase().includes(needle)
    )
  }, [entries, query])

  const grouped = useMemo(() => groupByCategory(filtered), [filtered])

  return (
    <div className="p-3 flex flex-col gap-4" data-testid="component-panel">
      <div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components"
          data-testid="component-panel-search"
          className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
        />
      </div>

      {filtered.length === 0 ? (
        <p
          className="text-sm text-neutral-400 px-1"
          data-testid="component-panel-empty"
        >
          No components match.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat)
            if (!items || items.length === 0) return null
            return (
              <div key={cat} data-testid={`component-panel-group-${cat}`}>
                <h3 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">
                  {CATEGORY_LABEL[cat]}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((entry) => (
                    <ComponentTile key={entry.name} entry={entry} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function groupByCategory(entries: CatalogEntry[]) {
  const map = new Map<CatalogCategory, CatalogEntry[]>()
  for (const entry of entries) {
    const list = map.get(entry.category) ?? []
    list.push(entry)
    map.set(entry.category, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) =>
      (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name)
    )
  }
  return map
}

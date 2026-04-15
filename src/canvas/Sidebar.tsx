import { useState } from 'react'
import { ComponentPanel } from './ComponentPanel'
import { LayersPanel } from './LayersPanel'

type SidebarTab = 'components' | 'layers'

/**
 * The left rail. Hosts a tab strip with Components (the catalog, drag
 * source for composing) and Layers (a tree view of the current
 * composition, navigation for selecting nodes).
 */
export function Sidebar() {
  const [tab, setTab] = useState<SidebarTab>('components')

  return (
    <div className="h-full flex flex-col" data-testid="sidebar">
      <nav
        role="tablist"
        aria-label="Sidebar tabs"
        className="shrink-0 flex items-center gap-1 p-2 border-b border-neutral-200 bg-white"
      >
        <TabButton
          id="components"
          label="Components"
          active={tab === 'components'}
          onClick={() => setTab('components')}
        />
        <TabButton
          id="layers"
          label="Layers"
          active={tab === 'layers'}
          onClick={() => setTab('layers')}
        />
      </nav>
      <div className="flex-1 overflow-y-auto">
        {tab === 'components' ? <ComponentPanel /> : <LayersPanel />}
      </div>
    </div>
  )
}

interface TabButtonProps {
  id: SidebarTab
  label: string
  active: boolean
  onClick: () => void
}

function TabButton({ id, label, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-testid={`sidebar-tab-${id}`}
      onClick={onClick}
      className={[
        'flex-1 text-xs font-medium px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 transition-colors',
        active
          ? 'bg-neutral-900 text-white'
          : 'text-neutral-600 hover:bg-neutral-100',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

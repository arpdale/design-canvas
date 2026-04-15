export function TopBar() {
  return (
    <header
      data-testid="topbar"
      className="h-12 shrink-0 border-b border-neutral-200 bg-white flex items-center px-4"
    >
      <span className="font-semibold text-neutral-900">Design Canvas</span>
      <span className="ml-3 text-xs text-neutral-500">POC · MVP</span>
    </header>
  )
}

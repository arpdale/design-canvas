/**
 * Convert an arbitrary composition name into a valid PascalCase
 * identifier usable as a React component name and (with .tsx) as a
 * filename. Falls back to a stable default if the input yields nothing.
 */
export function toComponentName(raw: string, fallback = 'UntitledScreen'): string {
  const cleaned = raw
    .replace(/[^A-Za-z0-9_\s-]+/g, ' ')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  if (!cleaned) return fallback
  // Components must start with an uppercase letter.
  const withLeader = /^[A-Za-z]/.test(cleaned) ? cleaned : `C${cleaned}`
  return withLeader.charAt(0).toUpperCase() + withLeader.slice(1)
}

export function toFilename(componentName: string): string {
  return `${componentName}.tsx`
}

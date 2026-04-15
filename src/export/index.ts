import type { Composition } from '../composition'
import * as prettier from 'prettier/standalone'
import prettierPluginTypeScript from 'prettier/plugins/typescript'
import prettierPluginEstree from 'prettier/plugins/estree'
import { toComponentName, toFilename } from './identifier'
import { collectUsedComponents, formatImport } from './imports'
import { emitNode } from './emit'

export { toComponentName, toFilename } from './identifier'
export { collectUsedComponents, DS_PACKAGE } from './imports'
export { emitNode } from './emit'

export interface ExportResult {
  componentName: string
  filename: string
  source: string
}

/**
 * Produce a standalone .tsx file for the given composition. The file
 * imports only the components actually used, wraps the tree in a named
 * function component, and is formatted with prettier.
 *
 * Pure async function over composition data + catalog. No React.
 */
export async function exportComposition(
  composition: Composition
): Promise<ExportResult> {
  const componentName = toComponentName(composition.name)
  const filename = toFilename(componentName)

  const used = collectUsedComponents(composition.roots)
  const importLine = formatImport(used)

  const body =
    composition.roots.length === 0
      ? '<></>'
      : composition.roots.length === 1
        ? emitNode(composition.roots[0])
        : `<>\n${composition.roots.map(emitNode).join('\n')}\n</>`

  const raw = [
    importLine,
    '',
    `export function ${componentName}() {`,
    `  return (`,
    `    ${body}`,
    `  );`,
    `}`,
    '',
  ]
    .filter((line) => line !== null)
    .join('\n')

  const source = await prettier.format(raw, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
    semi: true,
    singleQuote: false,
    jsxSingleQuote: false,
    trailingComma: 'all',
    printWidth: 80,
  })

  return { componentName, filename, source }
}

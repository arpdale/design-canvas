import type { JsonValue } from '../../composition'
import type { PropSchema } from '../../catalog'

interface PropFieldProps {
  schema: PropSchema
  value: JsonValue | undefined
  onChange: (value: JsonValue | undefined) => void
}

/**
 * Renders one of four field kinds — string, number, enum, boolean —
 * from a PropSchema. Kept deliberately small; covers ~90% of DS props.
 */
export function PropField({ schema, value, onChange }: PropFieldProps) {
  const label = schema.label ?? schema.name
  const baseInputClass =
    'w-full px-2 py-1 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400'

  return (
    <label
      className="flex flex-col gap-1"
      data-testid={`prop-field-${schema.name}`}
    >
      <span className="text-xs text-neutral-600">{label}</span>
      {renderControl(schema, value, onChange, baseInputClass)}
      {schema.hint ? (
        <span className="text-[11px] text-neutral-400">{schema.hint}</span>
      ) : null}
    </label>
  )
}

function renderControl(
  schema: PropSchema,
  value: JsonValue | undefined,
  onChange: (value: JsonValue | undefined) => void,
  baseClass: string
) {
  switch (schema.kind) {
    case 'string': {
      const v = typeof value === 'string' ? value : ''
      if (schema.multiline) {
        return (
          <textarea
            data-testid={`prop-input-${schema.name}`}
            className={baseClass}
            rows={3}
            value={v}
            placeholder={schema.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      }
      return (
        <input
          data-testid={`prop-input-${schema.name}`}
          type="text"
          className={baseClass}
          value={v}
          placeholder={schema.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    }
    case 'number': {
      const v = typeof value === 'number' ? value : ''
      return (
        <input
          data-testid={`prop-input-${schema.name}`}
          type="number"
          className={baseClass}
          value={v}
          min={schema.min}
          max={schema.max}
          step={schema.step}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') {
              onChange(undefined)
              return
            }
            const n = Number(raw)
            if (!Number.isNaN(n)) onChange(n)
          }}
        />
      )
    }
    case 'enum': {
      const v = typeof value === 'string' ? value : schema.values[0]
      return (
        <select
          data-testid={`prop-input-${schema.name}`}
          className={baseClass}
          value={v}
          onChange={(e) => onChange(e.target.value)}
        >
          {schema.values.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      )
    }
    case 'boolean': {
      const v = value === true
      return (
        <input
          data-testid={`prop-input-${schema.name}`}
          type="checkbox"
          className="h-4 w-4 rounded border border-neutral-300"
          checked={v}
          onChange={(e) => onChange(e.target.checked)}
        />
      )
    }
  }
}

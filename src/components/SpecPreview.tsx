import { lazy, Suspense } from 'react'
import { SpecReference } from './SpecReference'
import { SwaggerReference } from './SwaggerReference'

// The YAML parser is ~100KB and is only needed once a preview is actually
// shown — the landing page opens in edit-only layout, so loading it eagerly
// taxed every visitor for a pane most of them had not opened yet.
const Rendered = lazy(async () => {
  const { parseForPreview } = await import('../lib/parseSpec')
  return {
    default: ({ body, renderer }: { body: string; renderer: Renderer }) => {
      const { doc, problem, looksLikeSpec } = parseForPreview(body)

      // While the document is unparseable, say so quietly. This runs as the
      // user types, so an alarming error on every incomplete keystroke would
      // be worse than useless.
      if (!doc || !looksLikeSpec) {
        return (
          <div className="preview-hint">
            Waiting for a valid document…
            {problem && <span className="why">{problem}</span>}
          </div>
        )
      }

      return renderer === 'swagger' ? (
        <SwaggerReference doc={doc} />
      ) : (
        <SpecReference content={body} />
      )
    },
  }
})

export type Renderer = 'scalar' | 'swagger'

const KEY = 'spec.renderer'

export function loadRenderer(): Renderer {
  return localStorage.getItem(KEY) === 'swagger' ? 'swagger' : 'scalar'
}

export function saveRenderer(r: Renderer) {
  localStorage.setItem(KEY, r)
}

/**
 * Renders a spec in whichever view is selected.
 *
 * <p>Scalar takes the raw text and parses it itself. Swagger UI wants an
 * object, so the document is parsed here — which is also what lets the
 * editor preview work before anything is saved.</p>
 */
export function SpecPreview({ body, renderer }: { body: string; renderer: Renderer }) {
  if (!body.trim()) {
    return <div className="preview-hint">Paste a spec to see it rendered here.</div>
  }
  return (
    <Suspense fallback={<div className="preview-hint">preparing preview…</div>}>
      <Rendered body={body} renderer={renderer} />
    </Suspense>
  )
}

/** Shared control for choosing a renderer. */
export function RendererToggle({
  renderer,
  onChange,
}: {
  renderer: Renderer
  onChange: (r: Renderer) => void
}) {
  return (
    <div className="seg">
      <button
        className={renderer === 'scalar' ? 'on' : ''}
        onClick={() => onChange('scalar')}
      >
        OpenAPI
      </button>
      <button
        className={renderer === 'swagger' ? 'on' : ''}
        onClick={() => onChange('swagger')}
      >
        Swagger
      </button>
    </div>
  )
}

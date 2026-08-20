import { useEffect, useState } from 'react'
import {
  RendererToggle,
  SpecPreview,
  loadRenderer,
  saveRenderer,
  type Renderer,
} from './SpecPreview'

export type Layout = 'edit' | 'split' | 'preview'

/**
 * Editor with a live preview, shared by the create and update pages.
 *
 * <p>Seeing the rendered result before committing to a link is the point:
 * a spec that parses is not necessarily a spec that reads well, and the
 * only way to know is to look at it.</p>
 */
export function SpecEditor({
  body,
  onChange,
  placeholder,
}: {
  body: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [layout, setLayout] = useState<Layout>('edit')
  const [renderer, setRenderer] = useState<Renderer>(loadRenderer)

  // Debounced copy drives the preview. Re-parsing and re-rendering a large
  // spec on every keystroke makes typing feel laggy; a short pause is
  // imperceptible and keeps the editor responsive.
  const [debounced, setDebounced] = useState(body)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(body), 400)
    return () => clearTimeout(timer)
  }, [body])

  function chooseRenderer(r: Renderer) {
    setRenderer(r)
    saveRenderer(r)
  }

  return (
    <div className="editor-shell">
      <div className="editor-bar">
        <div className="seg">
          <button className={layout === 'edit' ? 'on' : ''} onClick={() => setLayout('edit')}>
            edit
          </button>
          <button className={layout === 'split' ? 'on' : ''} onClick={() => setLayout('split')}>
            split
          </button>
          <button
            className={layout === 'preview' ? 'on' : ''}
            onClick={() => setLayout('preview')}
          >
            preview
          </button>
        </div>

        {layout !== 'edit' && (
          <RendererToggle renderer={renderer} onChange={chooseRenderer} />
        )}
      </div>

      <div className={`editor-panes ${layout}`}>
        {layout !== 'preview' && (
          <textarea
            className="editor"
            value={body}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
          />
        )}

        {layout !== 'edit' && (
          <div className="preview-pane">
            <SpecPreview body={debounced} renderer={renderer} />
          </div>
        )}
      </div>
    </div>
  )
}

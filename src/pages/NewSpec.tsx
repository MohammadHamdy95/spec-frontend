import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSpec } from '../api/client'
import { ApiError } from '../api/types'
import { formatBytes } from '../lib/format'

const EXPIRY_OPTIONS = [
  { label: 'never', value: 0 },
  { label: '1 day', value: 1 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
]

export function NewSpec() {
  const navigate = useNavigate()
  const [body, setBody] = useState('')
  const [note, setNote] = useState('')
  const [expiresInDays, setExpiresInDays] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const bytes = new TextEncoder().encode(body).length

  async function save() {
    setSaving(true)
    setErrors([])
    setMessage(null)
    try {
      const spec = await createSpec({
        body,
        expiresInDays: expiresInDays || null,
        note: note.trim() || null,
      })
      // The edit token comes back exactly once. Hand it to the view page in
      // router state rather than the URL, so it never lands in history,
      // logs or a shared link.
      navigate(`/${spec.id}`, { state: { spec, justCreated: true } })
    } catch (e) {
      if (e instanceof ApiError) {
        setMessage(e.message)
        setErrors(e.errors)
      } else {
        setMessage(e instanceof Error ? e.message : 'Something went wrong')
      }
      setSaving(false)
    }
  }

  return (
    <div className="new-spec">
      <header className="page-head">
        <h1>Share an OpenAPI spec</h1>
        <p className="sub">
          Paste a Swagger or OpenAPI document — JSON or YAML, either is fine.
          You get a link, and you can update it later without the link changing.
        </p>
      </header>

      <textarea
        className="editor"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={'openapi: 3.0.3\ninfo:\n  title: Orders API\n  version: "1.0.0"\npaths:\n  /orders:\n    get:\n      responses:\n        "200":\n          description: ok'}
        spellCheck={false}
      />

      {message && (
        <div className="banner error">
          <strong>{message}</strong>
          {errors.length > 0 && (
            <ul className="error-list">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="controls">
        <label>
          expires
          <select
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
          >
            {EXPIRY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grow">
          note
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="optional — what changed in this revision"
          />
        </label>

        <span className="size">{formatBytes(bytes)}</span>

        <button onClick={save} disabled={saving || body.trim().length === 0}>
          {saving ? 'checking…' : 'share'}
        </button>
      </div>

      <p className="fineprint">
        Anyone with the link can read this. Specs often carry internal
        hostnames, staging URLs and example keys — worth a glance before you
        share it.
      </p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSpec, updateSpec } from '../api/client'
import { ApiError } from '../api/types'
import { formatBytes } from '../lib/format'

/**
 * Update an existing spec. Requires the edit token issued at creation —
 * the link stays the same, a new version is appended.
 */
export function EditSpec() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [body, setBody] = useState('')
  const [note, setNote] = useState('')
  const [token, setToken] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!id) return
    // Prefill with the current content so an edit is a change, not a retype.
    getSpec(id)
      .then((spec) => setBody(spec.body))
      .catch(() => setMessage('Could not load this spec.'))
      .finally(() => setLoaded(true))
  }, [id])

  async function save() {
    if (!id) return
    setSaving(true)
    setErrors([])
    setMessage(null)
    try {
      await updateSpec(id, token.trim(), body, note.trim() || null)
      navigate(`/${id}`)
    } catch (e) {
      if (e instanceof ApiError) {
        setMessage(
          e.status === 403
            ? 'That edit token is not right for this spec.'
            : e.message,
        )
        setErrors(e.errors)
      } else {
        setMessage(e instanceof Error ? e.message : 'Something went wrong')
      }
      setSaving(false)
    }
  }

  if (!loaded) return <div className="notice">loading…</div>

  const bytes = new TextEncoder().encode(body).length

  return (
    <div className="new-spec">
      <header className="page-head">
        <h1>Update spec</h1>
        <p className="sub">
          Saves as a new version. The link and every earlier version stay
          exactly as they are.
        </p>
      </header>

      <textarea
        className="editor"
        value={body}
        onChange={(e) => setBody(e.target.value)}
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
        <label className="grow">
          edit token
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="the token shown when this spec was created"
          />
        </label>

        <label className="grow">
          note
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="what changed"
          />
        </label>

        <span className="size">{formatBytes(bytes)}</span>

        <button onClick={save} disabled={saving || !token.trim() || !body.trim()}>
          {saving ? 'checking…' : 'save version'}
        </button>
      </div>
    </div>
  )
}

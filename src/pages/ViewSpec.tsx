import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  getDiff,
  getSpec,
  getSpecVersion,
  jsonUrl,
  listVersions,
  rawUrl,
  yamlUrl,
} from '../api/client'
import {
  ApiError,
  SPEC_VERSION_LABELS,
  type Spec,
  type SpecDiff,
  type VersionSummary,
} from '../api/types'
import { formatBytes, formatDate, pluralise } from '../lib/format'
import { SpecReference } from '../components/SpecReference'
import { DiffView } from '../components/DiffView'

type Tab = 'docs' | 'source' | 'history' | 'diff'

export function ViewSpec() {
  const { id, version } = useParams<{ id: string; version?: string }>()
  const { state } = useLocation()

  // A just-created spec arrives via router state, which is also the only
  // time the edit token exists — it is never returned by a read.
  const [spec, setSpec] = useState<Spec | null>(state?.spec ?? null)
  const [editToken] = useState<string | null>(state?.spec?.editToken ?? null)
  const justCreated = Boolean(state?.justCreated)

  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('docs')
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [diff, setDiff] = useState<SpecDiff | null>(null)
  const [copied, setCopied] = useState(false)

  const pinned = version ? Number(version) : null

  useEffect(() => {
    if (!id) return
    // Re-fetch when a specific version is pinned, or when we arrived cold.
    if (spec && !pinned) return
    const load = pinned ? getSpecVersion(id, pinned) : getSpec(id)
    load.then(setSpec).catch((e) =>
      setError(
        e instanceof ApiError && e.status === 404
          ? 'This spec does not exist — it may have expired.'
          : e instanceof Error
            ? e.message
            : 'Something went wrong',
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pinned])

  useEffect(() => {
    if (!id || tab !== 'history') return
    listVersions(id).then(setVersions).catch(() => setVersions([]))
  }, [id, tab])

  useEffect(() => {
    if (!id || tab !== 'diff' || !spec) return
    if (spec.latestVersion < 2) return
    getDiff(id).then(setDiff).catch(() => setDiff(null))
  }, [id, tab, spec])

  async function copyLink() {
    if (!spec) return
    await navigator.clipboard.writeText(spec.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (error) {
    return (
      <div className="notice error-page">
        <p>{error}</p>
        <Link to="/">share a spec</Link>
      </div>
    )
  }
  if (!spec) return <div className="notice">loading…</div>

  const canDiff = spec.latestVersion >= 2

  return (
    <div className="view-spec">
      {justCreated && editToken && (
        <div className="banner warn">
          <p>
            <strong>Save your edit token.</strong> It is shown once and cannot be
            recovered — it is what lets you update this spec without the link
            changing.
          </p>
          <code className="token">{editToken}</code>
        </div>
      )}

      <header className="spec-head">
        <div>
          <h1>{spec.title}</h1>
          <p className="sub">
            {SPEC_VERSION_LABELS[spec.specVersion] ?? spec.specVersion}
            {spec.apiVersion && <> · API {spec.apiVersion}</>}
            {' · '}
            {pluralise(spec.operationCount, 'operation')}
            {' · '}
            {formatBytes(spec.sizeBytes)}
          </p>
        </div>
        <div className="actions">
          <button onClick={copyLink}>{copied ? 'copied!' : 'copy link'}</button>
          <a className="button" href={jsonUrl(spec.id)} target="_blank" rel="noreferrer">
            JSON
          </a>
          <a className="button" href={yamlUrl(spec.id)} target="_blank" rel="noreferrer">
            YAML
          </a>
          <a className="button" href={rawUrl(spec.id)} target="_blank" rel="noreferrer">
            raw
          </a>
        </div>
      </header>

      {pinned && pinned !== spec.latestVersion && (
        <div className="banner">
          Viewing v{pinned} — <Link to={`/${spec.id}`}>v{spec.latestVersion} is current</Link>.
        </div>
      )}

      <nav className="tabs">
        <button className={tab === 'docs' ? 'on' : ''} onClick={() => setTab('docs')}>
          docs
        </button>
        <button className={tab === 'source' ? 'on' : ''} onClick={() => setTab('source')}>
          source
        </button>
        <button className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}>
          history ({spec.latestVersion})
        </button>
        {canDiff && (
          <button className={tab === 'diff' ? 'on' : ''} onClick={() => setTab('diff')}>
            what changed
          </button>
        )}
      </nav>

      {tab === 'docs' && <SpecReference content={spec.body} />}

      {tab === 'source' && (
        <pre className="source">
          <code>{spec.body}</code>
        </pre>
      )}

      {tab === 'history' && (
        <ul className="versions">
          {versions.map((v) => (
            <li key={v.version}>
              <Link to={`/${spec.id}/v/${v.version}`}>v{v.version}</Link>
              <span className="meta">
                {formatDate(v.createdAt)} · {pluralise(v.operationCount, 'operation')} ·{' '}
                {formatBytes(v.sizeBytes)}
              </span>
              {v.note && <span className="note">{v.note}</span>}
              {v.version === spec.latestVersion && <span className="badge">current</span>}
            </li>
          ))}
        </ul>
      )}

      {tab === 'diff' &&
        (diff ? <DiffView diff={diff} /> : <div className="notice">comparing…</div>)}
    </div>
  )
}

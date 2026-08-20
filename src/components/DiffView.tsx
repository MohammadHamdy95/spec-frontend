import type { SpecDiff } from '../api/types'
import { pluralise } from '../lib/format'

/**
 * A semantic diff, not a text diff: reordering paths or reflowing YAML
 * shows nothing here, while removing a required field shows up and is
 * flagged. Breaking changes sort first because they are the reason anyone
 * opens this view.
 */
export function DiffView({ diff }: { diff: SpecDiff }) {
  if (diff.changes.length === 0) {
    return (
      <div className="banner ok">
        No API-level differences between v{diff.fromVersion} and v{diff.toVersion}.
        Formatting or comments may still differ.
      </div>
    )
  }

  return (
    <div className="diff">
      <div className={`banner ${diff.compatible ? 'ok' : 'warn'}`}>
        {diff.compatible ? (
          <>
            v{diff.fromVersion} → v{diff.toVersion}: {pluralise(diff.changes.length, 'change')},
            none breaking. Existing clients keep working.
          </>
        ) : (
          <>
            v{diff.fromVersion} → v{diff.toVersion}:{' '}
            <strong>{pluralise(diff.breakingCount, 'breaking change')}</strong> out of{' '}
            {pluralise(diff.changes.length, 'change')}.
          </>
        )}
      </div>

      <ul className="change-list">
        {diff.changes.map((change, i) => (
          <li key={i} className={change.breaking ? 'breaking' : ''}>
            <span className={`kind ${change.kind.toLowerCase()}`}>{change.kind}</span>
            <span className="subject">{change.subject}</span>
            {change.breaking && <span className="badge">breaking</span>}
            <span className="detail">{change.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

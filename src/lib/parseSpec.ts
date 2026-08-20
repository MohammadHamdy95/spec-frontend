import { parse as parseYaml } from 'yaml'

export interface PreviewParse {
  /** Parsed document, or null while the text is not yet parseable. */
  doc: Record<string, unknown> | null
  /** Why it could not be parsed — shown gently, since the user is mid-typing. */
  problem: string | null
  /** Looks like a spec at all (has openapi: or swagger:). */
  looksLikeSpec: boolean
}

/**
 * Parses for the *preview* only. Deliberately permissive: the server is the
 * authority on whether a spec is publishable, and this runs on every
 * keystroke, when the document is usually half-written. Being strict here
 * would flash errors at someone who is simply not finished.
 *
 * YAML is used for both formats — YAML is a superset of JSON, so one parser
 * handles either without having to guess which we were given.
 */
export function parseForPreview(body: string): PreviewParse {
  const text = body.trim()
  if (!text) {
    return { doc: null, problem: null, looksLikeSpec: false }
  }

  let doc: unknown
  try {
    doc = parseYaml(text)
  } catch (e) {
    return {
      doc: null,
      problem: e instanceof Error ? e.message.split('\n')[0] : 'Could not parse',
      looksLikeSpec: false,
    }
  }

  if (doc === null || typeof doc !== 'object' || Array.isArray(doc)) {
    return { doc: null, problem: 'Not an object', looksLikeSpec: false }
  }

  const record = doc as Record<string, unknown>
  const looksLikeSpec = 'openapi' in record || 'swagger' in record

  return {
    doc: record,
    problem: looksLikeSpec ? null : 'No "openapi" or "swagger" key yet',
    looksLikeSpec,
  }
}

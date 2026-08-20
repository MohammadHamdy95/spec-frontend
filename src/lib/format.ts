/** Shared presentation helpers. */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

/**
 * "3 operations" / "1 operation" — small thing, but a plural bug in the
 * headline metric of every page is the kind of detail people notice.
 */
export function pluralise(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

export interface Spec {
  id: string
  url: string
  title: string
  apiVersion: string
  specVersion: 'swagger_2_0' | 'openapi_3_0' | 'openapi_3_1' | 'unknown'
  version: number
  latestVersion: number
  format: 'json' | 'yaml'
  sizeBytes: number
  operationCount: number
  note: string | null
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  body: string
  /** Present only in the create response — shown once, never returned on a read. */
  editToken: string | null
}

export interface VersionSummary {
  version: number
  sizeBytes: number
  operationCount: number
  format: 'json' | 'yaml'
  note: string | null
  createdAt: string
}

export interface DiffChange {
  kind: 'ADDED' | 'REMOVED' | 'MODIFIED'
  area: string
  subject: string
  detail: string
  breaking: boolean
}

export interface SpecDiff {
  fromVersion: number
  toVersion: number
  compatible: boolean
  breakingCount: number
  changes: DiffChange[]
}

export interface CreateSpecInput {
  body: string
  expiresInDays?: number | null
  note?: string | null
}

/**
 * Carries the backend's problem detail. `errors` is the list of parser
 * messages on a 422 — the reason someone can fix their spec instead of
 * guessing at "invalid".
 */
export class ApiError extends Error {
  status: number
  errors: string[]

  constructor(status: number, problem: { detail?: string; errors?: string[] } | null) {
    super(problem?.detail ?? 'Something went wrong')
    this.status = status
    this.errors = problem?.errors ?? []
  }
}

export const SPEC_VERSION_LABELS: Record<string, string> = {
  swagger_2_0: 'Swagger 2.0',
  openapi_3_0: 'OpenAPI 3.0',
  openapi_3_1: 'OpenAPI 3.1',
  unknown: 'Unknown',
}

import {
  ApiError,
  type CreateSpecInput,
  type Spec,
  type SpecDiff,
  type VersionSummary,
} from './types'

// Always same-origin: /v1 is proxied to the backend by vite in dev and by
// the platform Caddy in built images. api.spec.hamdy.app is deliberately
// not used — a two-level subdomain is not covered by Cloudflare's free
// Universal SSL.
const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, init)
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new ApiError(response.status, problem)
  }
  return response.json() as Promise<T>
}

export function createSpec(input: CreateSpecInput): Promise<Spec> {
  return request('/v1/specs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updateSpec(
  id: string,
  editToken: string,
  body: string,
  note?: string | null,
): Promise<Spec> {
  return request(`/v1/specs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Token': editToken },
    body: JSON.stringify({ body, note }),
  })
}

export function getSpec(id: string): Promise<Spec> {
  return request(`/v1/specs/${id}`)
}

export function getSpecVersion(id: string, version: number): Promise<Spec> {
  return request(`/v1/specs/${id}/versions/${version}`)
}

export function listVersions(id: string): Promise<VersionSummary[]> {
  return request(`/v1/specs/${id}/versions`)
}

export function getDiff(id: string, from?: number, to?: number): Promise<SpecDiff> {
  const params = new URLSearchParams()
  if (from != null) params.set('from', String(from))
  if (to != null) params.set('to', String(to))
  const query = params.toString()
  return request(`/v1/specs/${id}/diff${query ? `?${query}` : ''}`)
}

export const rawUrl = (id: string) => `${BASE}/v1/specs/${id}/raw`
export const jsonUrl = (id: string) => `${BASE}/v1/specs/${id}/json`
export const yamlUrl = (id: string) => `${BASE}/v1/specs/${id}/yaml`

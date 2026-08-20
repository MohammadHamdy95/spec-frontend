import { lazy, Suspense } from 'react'

/**
 * Swagger UI — the presentation most people recognise, offered alongside
 * the Scalar reference because familiarity matters when you are sharing
 * docs with a team.
 *
 * <p>Lazy-loaded for the same reason as the other renderer: it is a large
 * dependency and nobody should download it unless they choose this view.</p>
 *
 * <p>"Try it out" is disabled. Swagger UI executes those calls from the
 * viewer's own browser rather than through our server, so it is not an
 * SSRF path against this host — but a shared spec whose `servers:` entry
 * points at a private address would have readers firing requests into
 * their own networks, and CORS blocks most of it anyway. Off is the honest
 * default for a document-sharing tool; it is one flag to change.</p>
 */
const SwaggerUI = lazy(async () => {
  const [mod] = await Promise.all([
    import('swagger-ui-react'),
    import('swagger-ui-react/swagger-ui.css'),
  ])
  return { default: mod.default }
})

export function SwaggerReference({ doc }: { doc: Record<string, unknown> }) {
  return (
    <div className="reference swagger">
      <Suspense fallback={<div className="notice">loading Swagger UI…</div>}>
        <SwaggerUI spec={doc} tryItOutEnabled={false} supportedSubmitMethods={[]} />
      </Suspense>
    </div>
  )
}

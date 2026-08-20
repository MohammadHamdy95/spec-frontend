import { lazy, Suspense } from 'react'

/**
 * The rendered API reference — the read experience that is the product.
 *
 * <p>Loaded lazily on purpose. The renderer is ~2.2MB of JavaScript, and
 * the landing page is the *editor*, which never needs it. Without this
 * split, every visitor pays for the viewer before they have pasted
 * anything.</p>
 *
 * <p>Try-it-out is off. Executing calls would either proxy through our
 * server — an SSRF relay against everything this host can reach — or need
 * CORS the target API almost certainly does not grant. Neither is worth it
 * for a document-sharing tool.</p>
 */
const ApiReference = lazy(async () => {
  const [{ ApiReferenceReact }] = await Promise.all([
    import('@scalar/api-reference-react'),
    import('@scalar/api-reference-react/style.css'),
  ])
  return { default: ApiReferenceReact }
})

export function SpecReference({ content }: { content: string }) {
  return (
    <div className="reference">
      <Suspense fallback={<div className="notice">loading reference…</div>}>
        <ApiReference
          configuration={{
            content,
            hideClientButton: true,
            isEditable: false,
            hideTestRequestButton: true,
          }}
        />
      </Suspense>
    </div>
  )
}

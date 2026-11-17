import Navbar from '../Home/Navbar'
import Footer from '../Home/Footer'

const verdicts = {
  MALICIOUS: ['Malicious', '#f87171'],
  SUSPICIOUS: ['Suspicious', '#fbbf24'],
  UNKNOWN: ['Unknown', '#94a3b8'],
  NO_KNOWN_THREATS: ['No known threats', '#34d399'],
}

const details = {
  public: 'Public DNS records found',
  non_public: 'Domain resolves to a restricted address',
  not_found: 'No DNS address records found',
  valid: 'Certificate verified on HTTPS port 443',
  invalid: 'Certificate verification failed',
  hostname_mismatch: 'Certificate hostname mismatch',
  unencrypted: 'Submitted URL uses HTTP',
  not_checked: 'TLS check skipped for this destination or port',
  unknown: 'Check unavailable',
  missing_api_key: 'Provider not configured',
  quota_exceeded: 'Provider quota exceeded',
  no_report: 'No report available for this URL',
  timeout: 'Provider timed out',
  analysis_pending: 'Analysis is still pending',
  analysis_id_missing: 'Submission accepted. Analysis reference unavailable',
  network_error: 'Network error',
  network_or_invalid_response: 'Network error or invalid provider response',
  http_error: 'Provider rejected the request',
  no_engine_verdicts: 'No conclusive engine results',
  non_public_dns: 'Skipped for restricted DNS destination',
}

function readResult() {
  try {
    const data = JSON.parse(sessionStorage.getItem('latestScanResult'))?.data
    return Object.hasOwn(verdicts, data?.verdict) && Number.isFinite(data.score) ? data : null
  } catch {
    return null
  }
}

export default function Result() {
  const data = readResult()
  const [label, color] = verdicts[data?.verdict] || ['No scan report', '#94a3b8']
  const checks = data?.threatDetails || {}
  const vt = checks.virusTotal
  const hasStats = vt?.status === 'completed' || vt?.status === 'stale'
  const reputation = Number.isFinite(vt?.reputation) ? `Community reputation ${vt.reputation}` : null
  const categories = [...new Set(Object.values(vt?.categories || {}).filter(value => typeof value === 'string'))]
    .slice(0, 3).join(', ')
  const cards = [
    ['Google threat lists', checks.googleSafeBrowsing === 'match' ? checks.googleThreatTypes?.join(', ')
      : checks.googleSafeBrowsing === 'no_match' ? 'No known list match' : details[checks.googleReason] || details.unknown],
    ['VirusTotal reputation', hasStats
      ? [
        `${vt.malicious} malicious · ${vt.suspicious} suspicious · ${vt.harmless} harmless · ${vt.undetected} undetected`,
        vt.status === 'stale' && 'Stale report',
        vt.analyzedAt && `Analyzed ${new Date(vt.analyzedAt).toLocaleDateString()}`,
        reputation,
        categories,
      ].filter(Boolean).join(' · ')
      : details[vt?.reason] || (vt?.status === 'pending' ? details.analysis_pending : details.unknown)],
    ['DNS resolution', details[checks.dnsStatus] || details.unknown],
    ['HTTPS certificate', [details[checks.sslStatus] || details.unknown,
      checks.certificate?.issuer && `Issuer ${checks.certificate.issuer}`,
      checks.certificate?.ageDays >= 0 && `Issued ${checks.certificate.ageDays} day(s) ago`].filter(Boolean).join(' · ')],
    ['Domain registration', checks.domainAge?.status === 'available'
      ? `${checks.domainAge.ageDays} days old` : 'Registration date unavailable'],
    ['Typosquatting reference', checks.trancoStatus === 'available' ? 'Tranco comparison ran' : 'Tranco list unavailable'],
    ['OpenPhish feed', checks.openPhish?.status === 'match' ? 'Exact phishing URL match'
      : checks.openPhish?.status === 'no_match' ? 'No exact feed match'
        : checks.openPhish?.status === 'disabled' ? 'Feed not configured' : 'Feed unavailable'],
    ['Redirect evidence', checks.virusTotal?.finalHost
      ? `VirusTotal observed ${checks.virusTotal.finalHost} as the final host` : 'No redirect metadata available'],
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-cyan-900/50 bg-[#03080f] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold">Security Analysis Report</h1>
              {data && <p className="mt-2 text-sm text-slate-400">Checked {new Date(data.scannedAt).toLocaleString()}</p>}
            </div>
            <a href="/" className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-slate-950">Scan a URL</a>
          </div>
          {data ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-slate-800 bg-[#040a12] p-8 text-center">
              <div className="relative grid h-52 w-52 place-items-center rounded-full"
                style={{ background: `conic-gradient(${color} ${data.score}%, #1f2937 0)` }}>
                <div className="absolute inset-[10px] rounded-full bg-[#040a12]" />
                <div className="relative">
                  <p className="text-7xl font-extrabold" style={{ color }}>{data.score}</p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-slate-400">Risk score / 100</p>
                </div>
              </div>
              <p className="mt-7 rounded-full border px-6 py-2 text-xl font-semibold" style={{ color }}>{label}</p>
              <p className="mt-2 text-sm text-slate-400">Confidence {data.confidence.toLowerCase()} · Higher scores indicate more risk</p>
              <p className="mt-4 max-w-full break-all text-slate-200">{data.url}</p>
            </div>
          ) : <p className="mt-6 text-slate-300">{label}. Run a new scan to see a score.</p>}
        </section>
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map(([title, description]) => (
                <section key={title} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-2 break-words text-sm text-slate-300">{description}</p>
                </section>
              ))}
            </div>
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-bold">Why this score?</h2>
              {data.reasons?.length ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                  {data.reasons.map(reason => <li key={reason.id}>{reason.explanation} <span className="text-slate-400">Weight {reason.weight}</span></li>)}
                </ul>
              ) : <p className="mt-2 text-slate-400">No risk signals triggered in the checks that returned evidence.</p>}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

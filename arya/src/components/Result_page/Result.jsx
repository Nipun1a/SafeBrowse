import React, { useMemo } from 'react'
import Navbar from '../Home/Navbar'
import Footer from '../Home/Footer'

const getScoreStatus = (score) => {
  if (score >= 85) return { label: 'Website Safe', tone: 'emerald' }
  if (score >= 70) return { label: 'Low Risk', tone: 'green' }
  if (score >= 50) return { label: 'Moderate Risk', tone: 'yellow' }
  if (score >= 30) return { label: 'High Risk', tone: 'orange' }
  return { label: 'Dangerous', tone: 'red' }
}

const getToneStyles = (tone) => {
  if (tone === 'green') {
    return {
      text: 'text-green-400',
      pill: 'border-green-500/45 bg-green-500/10 text-green-400',
      dot: '#4ade80',
      bar: 'bg-green-400',
    }
  }

  if (tone === 'yellow') {
    return {
      text: 'text-yellow-400',
      pill: 'border-yellow-500/45 bg-yellow-500/10 text-yellow-400',
      dot: '#facc15',
      bar: 'bg-yellow-400',
    }
  }

  if (tone === 'orange') {
    return {
      text: 'text-orange-400',
      pill: 'border-orange-500/45 bg-orange-500/10 text-orange-400',
      dot: '#fb923c',
      bar: 'bg-orange-400',
    }
  }

  if (tone === 'red') {
    return {
      text: 'text-red-400',
      pill: 'border-red-500/45 bg-red-500/10 text-red-400',
      dot: '#ef4444',
      bar: 'bg-red-500',
    }
  }

  return {
    text: 'text-emerald-400',
    pill: 'border-emerald-500/45 bg-emerald-500/10 text-emerald-400',
    dot: '#22e38b',
    bar: 'bg-emerald-400',
  }
}

const getCardPillStyle = (status) => {
  if (status === 'Risk') return 'bg-red-500'
  if (status === 'Warning') return 'bg-amber-400'
  if (status === 'Unknown') return 'bg-slate-400'
  return 'bg-emerald-400'
}

const Result = () => {
  const scanPayload = useMemo(() => {
    try {
      const session = sessionStorage.getItem('latestScanResult')
      return session ? JSON.parse(session) : null
    } catch {
      return null
    }
  }, [])

  const scanData = scanPayload?.data || {}
  const scoreRaw = Number(scanData?.score)
  const trustScore = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : 94
  const scoreStatus = getScoreStatus(trustScore)
  const toneStyles = getToneStyles(scoreStatus.tone)
  const scoreDegrees = Math.round((trustScore / 100) * 360)

  const scanDate = scanData?.scannedAt || scanData?.createdAt
  const generatedLabel = scanDate ? new Date(scanDate).toLocaleString() : 'Sample data'
  const scanId = scanData?._id ? String(scanData._id).slice(-10).toUpperCase() : 'GI-88291-XA'
  const analyzedUrl = scanData?.url || 'https://guardlink.ai/secure-gateway'
  const threatDetails = scanData?.threatDetails || {}
  const googleVerdict = threatDetails?.googleSafeBrowsing || 'unknown'
  const normalizedGoogleVerdict = String(googleVerdict).toLowerCase()
  const virusTotalMalicious = threatDetails?.virusTotal?.malicious ?? 0
  const virusTotalHarmless = threatDetails?.virusTotal?.harmless ?? 0
  const sslValid = threatDetails?.sslValid ? 'Valid' : 'Not Valid'

  const parsedUrl = useMemo(() => {
    try {
      return new URL(analyzedUrl)
    } catch {
      return null
    }
  }, [analyzedUrl])

  const hostName = parsedUrl?.hostname || scanData?.domain || 'Unknown'
  const protocol = parsedUrl?.protocol?.replace(':', '').toUpperCase() || 'Unknown'
  const pathName = parsedUrl?.pathname || '/'

  const cardWeights = useMemo(() => {
    const threatWeight = normalizedGoogleVerdict === 'clean' ? 10 : normalizedGoogleVerdict === 'unknown' ? 35 : 70
    const reputationWeight = virusTotalMalicious > 0 ? 70 : virusTotalHarmless > 0 ? 10 : 30
    const sslWeight = threatDetails?.sslValid ? 15 : 55
    const total = threatWeight + reputationWeight + sslWeight

    return {
      threat: Math.round((threatWeight / total) * 100),
      reputation: Math.round((reputationWeight / total) * 100),
      ssl: Math.round((sslWeight / total) * 100),
    }
  }, [normalizedGoogleVerdict, virusTotalMalicious, virusTotalHarmless, threatDetails?.sslValid])

  const resultCards = useMemo(
    () => [
      {
        title: 'Threat Detection',
        status: normalizedGoogleVerdict === 'clean' ? 'Safe' : normalizedGoogleVerdict === 'unknown' ? 'Unknown' : 'Risk',
        description: `Google Safe Browsing verdict for ${hostName}: ${googleVerdict}.`,
        contribution: `${cardWeights.threat}%`,
      },
      {
        title: 'Reputation Scan',
        status: virusTotalMalicious > 0 ? 'Risk' : 'Safe',
        description: `VirusTotal summary for ${hostName}: malicious ${virusTotalMalicious}, harmless ${virusTotalHarmless}.`,
        contribution: `${cardWeights.reputation}%`,
      },
      {
        title: 'SSL Security Check',
        status: threatDetails?.sslValid ? 'Safe' : 'Warning',
        description: `TLS/SSL validation for ${hostName}: ${sslValid}.`,
        contribution: `${cardWeights.ssl}%`,
      },
    ],
    [normalizedGoogleVerdict, hostName, googleVerdict, cardWeights, virusTotalMalicious, virusTotalHarmless, threatDetails?.sslValid, sslValid],
  )

  const strengths = useMemo(() => {
    const items = []
    if (normalizedGoogleVerdict === 'clean') items.push('Google Safe Browsing did not flag this URL as phishing or malware.')
    if (virusTotalMalicious === 0) items.push('No malicious detections were reported by VirusTotal.')
    if (virusTotalHarmless > 0) items.push(`VirusTotal marked ${virusTotalHarmless} engine checks as harmless.`)
    if (threatDetails?.sslValid) items.push('SSL/TLS certificate validation passed for this domain.')
    if (trustScore >= 70) items.push(`Overall trust score is ${trustScore}, indicating lower observed risk.`)
    return items.length ? items : ['The scan did not return enough positive signals for this URL.']
  }, [normalizedGoogleVerdict, virusTotalMalicious, virusTotalHarmless, threatDetails?.sslValid, trustScore])

  const concerns = useMemo(() => {
    const items = []
    if (normalizedGoogleVerdict !== 'clean') items.push(`Google Safe Browsing returned "${googleVerdict}", which requires manual review.`)
    if (virusTotalMalicious > 0) items.push(`VirusTotal reported ${virusTotalMalicious} malicious detection(s).`)
    if (!threatDetails?.sslValid) items.push('SSL/TLS validation failed or could not be confirmed.')
    if (trustScore < 70) items.push(`Trust score is ${trustScore}, indicating elevated risk for this link.`)
    return items.length ? items : ['No critical concerns were detected from the available scan signals.']
  }, [normalizedGoogleVerdict, googleVerdict, virusTotalMalicious, threatDetails?.sslValid, trustScore])

  const safeShare = trustScore
  const riskShare = Math.max(0, Math.round((100 - trustScore) * 0.6))
  const uncertainShare = Math.max(0, 100 - safeShare - riskShare)
  const whoisLink = hostName && hostName !== 'Unknown' ? `https://www.whois.com/whois/${hostName}` : '#'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-2xl border border-cyan-900/35 bg-[#03080f] p-6 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.14)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Security Analysis Report</h1>
              <p className="mt-2 text-sm text-slate-400 sm:text-base">Generated on {generatedLabel} • Scan ID: {scanId}</p>
              {!scanPayload ? (
                <p className="mt-2 text-xs text-amber-300">No recent live scan found. Showing sample values.</p>
              ) : (
                <p className="mt-2 text-xs text-cyan-300">Source: {scanPayload.source || 'live-scan'}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="/" className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                </svg>
                Re-scan Website
              </a>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-[#040a12] p-8 sm:p-10">
            <div className="mx-auto flex max-w-lg flex-col items-center">
              <div
                className="relative h-56 w-56 rounded-full"
                style={{
                  background: `conic-gradient(${toneStyles.dot} 0deg ${scoreDegrees}deg, #1f2937 ${scoreDegrees}deg 360deg)`,
                }}
              >
                <div className="absolute inset-[10px] rounded-full bg-[#040a12]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-7xl font-extrabold leading-none ${toneStyles.text}`}>{trustScore}</span>
                  <span className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Trust Score</span>
                </div>
              </div>

              <div className={`mt-8 inline-flex items-center gap-2 rounded-full border px-6 py-2 text-2xl font-semibold ${toneStyles.pill}`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
                </svg>
                {scoreStatus.label}
              </div>

              <p className="mt-4 text-sm text-slate-300 sm:text-base">
                Analyzed URL: <span className="font-semibold text-slate-100">{analyzedUrl}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resultCards.map((card) => (
              <article key={card.title} className="rounded-xl border border-slate-800 bg-slate-900/65 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-100">{card.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold text-slate-950 ${getCardPillStyle(card.status)}`}>{card.status}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{card.description}</p>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <span>Risk Contribution</span>
                    <span>{card.contribution}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: card.contribution }} />
                  </div>
                </div>

                <p className="mt-5 text-xs font-semibold text-cyan-400">Based on scanned target: {hostName}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
            <section className="rounded-xl border border-slate-800 bg-slate-900/65 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-bold text-slate-100">Why this score?</h3>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-400">Positive Signals ({strengths.length})</span>
                  <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-red-400">Concerns ({concerns.length})</span>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Security Strengths</h4>
                  <ul className="mt-3 space-y-3 text-sm text-slate-300">
                    {strengths.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-red-400">Minor Observations</h4>
                  <ul className="mt-3 space-y-3 text-sm text-slate-300">
                    {concerns.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 rounded-lg border border-slate-700 bg-[#0a111a] p-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <p>Risk Distribution</p>
                      <p>Automated Weighted AI Scoring</p>
                    </div>
                    <div className="mt-2 flex h-3 overflow-hidden rounded-full">
                      <span className="bg-emerald-400" style={{ width: `${safeShare}%` }} />
                      <span className="bg-amber-400" style={{ width: `${uncertainShare}%` }} />
                      <span className="bg-red-500" style={{ width: `${riskShare}%` }} />
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-[10px] font-semibold uppercase text-slate-400">
                      <span>Safe ({safeShare}%)</span>
                      <span>Uncertain ({uncertainShare}%)</span>
                      <span>Risk ({riskShare}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="rounded-xl border border-slate-800 bg-slate-900/65 p-5 sm:p-6">
              <h3 className="text-2xl font-bold text-slate-100">Site Information</h3>

              <div className="mt-4 overflow-hidden rounded-lg border border-slate-700">
                <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,#1e3a8a_0%,#0f172a_60%,#111827_100%)] text-lg font-bold text-white/90">
                  Security Snapshot
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Domain</span>
                  <span className="font-semibold text-slate-100">{hostName}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Protocol</span>
                  <span className="font-semibold text-slate-100">{protocol}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Path</span>
                  <span className="max-w-[180px] truncate font-semibold text-slate-100">{pathName}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Google Safe Browsing</span>
                  <span className="font-semibold text-slate-100">{googleVerdict}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">VirusTotal (malicious)</span>
                  <span className="font-semibold text-cyan-400">{virusTotalMalicious}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">VirusTotal (harmless)</span>
                  <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-200">{virusTotalHarmless}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">SSL Status</span>
                  <span className="font-semibold text-slate-100">{sslValid}</span>
                </div>
              </div>

              <a
                href={whoisLink}
                target="_blank"
                rel="noreferrer"
                className="mt-8 block w-full rounded-md border border-slate-700 bg-[#0a1018] py-2 text-center text-sm font-semibold text-slate-300 transition hover:border-cyan-700 hover:text-cyan-300"
              >
                View Full WHOIS Data
              </a>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Result

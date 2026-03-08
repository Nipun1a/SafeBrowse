import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../Home/Navbar'
import Footer from '../Home/Footer'

const STEP_DEFINITIONS = [
  { label: 'Analyzing URL structure', icon: 'globe' },
  { label: 'Checking malware databases', icon: 'shield' },
  { label: 'Scanning reputation engines', icon: 'search' },
  { label: 'Validating SSL certificate', icon: 'lock' },
  { label: 'Generating Trust Score', icon: 'pulse' },
]

const LOG_LINES = [
  '[SYSTEM] Hooking network interface...',
  '[INFO] Requesting header data from target host',
  '[AUTH] AI credentials validated via GuardLink-Auth',
  '[TRACE] Tracing hops: 12ms, 45ms, 22ms',
  '[INFO] Inspecting SSL/TLS certificate chain',
  '[INFO] Cross-checking threat intelligence feeds',
  '[WARN] SSL/TLS cipher: TLS 1.2 deprecated',
  '[DONE] Aggregating risk signals and trust score',
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const resolveApiBaseUrl = () => {
  if (!import.meta.env.DEV) {
    // In production, always hit same-origin /api and let Vercel rewrite proxy to backend.
    return '/api'
  }

  const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

  if (!configuredBaseUrl) {
    return 'http://localhost:5000/api'
  }

  const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '')

  if (!/^https?:\/\//i.test(normalizedBaseUrl)) {
    return normalizedBaseUrl
  }

  try {
    const parsed = new URL(normalizedBaseUrl)
    parsed.pathname = parsed.pathname.replace(/\/+$/, '')
    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = '/api'
    }
    return parsed.toString().replace(/\/+$/, '')
  } catch {
    return normalizedBaseUrl
  }
}

const StepIcon = ({ type, status }) => {
  if (status === 'DONE') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="m5 12 4 4L19 6" />
      </svg>
    )
  }

  if (type === 'shield') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
      </svg>
    )
  }

  if (type === 'search') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    )
  }

  if (type === 'lock') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </svg>
    )
  }

  if (type === 'pulse') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12h4l2-4 4 8 2-4h8" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4a14 14 0 0 1 0 16M12 4a14 14 0 0 0 0 16" />
    </svg>
  )
}

const Scan = () => {
  const [progress, setProgress] = useState(3)
  const [error, setError] = useState('')
  const [displayUrl, setDisplayUrl] = useState('')

  useEffect(() => {
    let cancelled = false
    let progressTimer
    let finishTimer

    const runScan = async () => {
      const pendingUrl = sessionStorage.getItem('pendingScanUrl')
      if (!pendingUrl) {
        setError('No URL found to scan. Please enter a URL from Home page.')
        return
      }

      setDisplayUrl(pendingUrl)
      const API_BASE_URL = resolveApiBaseUrl()
      const scanEndpoint = new URL('scan', `${API_BASE_URL}/`).toString()

      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) return prev
          if (prev < 35) return Math.min(92, prev + 2.6)
          if (prev < 70) return Math.min(92, prev + 1.5)
          return Math.min(92, prev + 0.8)
        })
      }, 180)

      const minDuration = delay(5000)

      try {
        const [response] = await Promise.all([
          fetch(scanEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: pendingUrl }),
          }),
          minDuration,
        ])

        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload?.error || 'Scan failed. Please try again.')
        }

        sessionStorage.setItem('latestScanResult', JSON.stringify(payload))

        clearInterval(progressTimer)
        finishTimer = setInterval(() => {
          setProgress((prev) => {
            const next = Math.min(100, prev + 3.8)
            if (next >= 100) {
              clearInterval(finishTimer)
              if (!cancelled) {
                sessionStorage.removeItem('pendingScanUrl')
                window.location.href = '/result'
              }
            }
            return next
          })
        }, 90)
      } catch (scanError) {
        clearInterval(progressTimer)
        if (!cancelled) {
          setError(scanError.message || 'Unable to scan this URL right now.')
        }
      }
    }

    runScan()

    return () => {
      cancelled = true
      clearInterval(progressTimer)
      clearInterval(finishTimer)
    }
  }, [])

  const steps = useMemo(() => {
    const currentIndex = Math.min(STEP_DEFINITIONS.length - 1, Math.floor(progress / 20))

    return STEP_DEFINITIONS.map((step, index) => {
      if (error) {
        return { ...step, status: index < currentIndex ? 'DONE' : 'QUEUED' }
      }

      if (progress >= 100 || index < currentIndex) {
        return { ...step, status: 'DONE' }
      }

      if (index === currentIndex) {
        return { ...step, status: 'PROCESSING' }
      }

      return { ...step, status: 'QUEUED' }
    })
  }, [progress, error])

  const engineStatus = error ? 'INTERRUPTED' : progress >= 100 ? 'COMPLETE' : 'PROCESSING...'
  const visibleLogCount = Math.min(LOG_LINES.length, Math.max(2, Math.ceil(progress / 13)))
  const visibleLogs = LOG_LINES.slice(0, visibleLogCount)
  const progressPercent = Math.round(progress)
  const etaSeconds = Math.max(1, Math.ceil((100 - progressPercent) / 12))

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-2xl border border-cyan-900/40 bg-[#03080f] p-5 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.18),0_30px_80px_-45px_rgba(6,182,212,0.4)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.12),transparent_40%),radial-gradient(circle_at_88%_70%,rgba(14,165,233,0.1),transparent_35%)]" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_420px] xl:items-start">
            <div className="pt-2 xl:pr-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Live Analysis Mode
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl">Evaluating Website Integrity</h1>
              <p className="mt-4 text-base text-slate-300 sm:text-lg">
                Target:{' '}
                <span className="break-all text-cyan-400">{displayUrl || 'Preparing target URL...'}</span>
              </p>

              <div className="relative mt-10 h-[360px] w-[360px] max-w-full">
                <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-900/40" />
                <div className="absolute left-1/2 top-1/2 h-[292px] w-[292px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-600/50 border-dashed" />
                <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-950/20" />

                <div className="absolute left-1/2 top-1/2 h-[292px] w-[292px] -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite]">
                  <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan-400" />
                  <div className="absolute left-1/2 top-2 h-[96px] w-[2px] -translate-x-1/2 bg-cyan-400/90" />
                </div>

                <div className="absolute left-1/2 top-1/2 h-[96px] w-[96px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/60 bg-slate-800/80 shadow-[0_0_45px_rgba(14,165,233,0.18)]">
                  <div className="flex h-full animate-pulse items-center justify-center text-cyan-400">
                    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="7" y="7" width="10" height="10" rx="1.5" />
                      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-7 text-xs uppercase tracking-[0.25em] text-slate-400 sm:text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Packet Stream
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" /> AI Synapse
                </span>
              </div>
            </div>

            <aside className="w-full rounded-2xl border border-cyan-900/40 bg-[#050c14]/95 p-5 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.16)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="5" rx="1.5" />
                    <rect x="3" y="14" width="18" height="5" rx="1.5" />
                  </svg>
                  Neural Diagnostics
                </h2>
                <span className="rounded-md bg-cyan-950/70 px-3 py-1 text-xs font-semibold text-cyan-300">ID: 4882-GX</span>
              </div>

              <div className="mt-6 rounded-xl border border-cyan-700/40 bg-cyan-950/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/60 text-cyan-400">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-semibold leading-tight text-cyan-300">Initializing Neural Engine Buffer</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{engineStatus}</p>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-5">
                {steps.map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <span
                      className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border ${
                        item.status === 'DONE'
                          ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300'
                          : item.status === 'PROCESSING'
                            ? 'border-cyan-400 text-cyan-300'
                            : 'border-slate-700 text-slate-300'
                      }`}
                    >
                      <StepIcon type={item.icon} status={item.status} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold leading-tight text-slate-200">{item.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.status}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl border border-cyan-900/45 bg-black/40 p-4 font-mono text-xs leading-6 text-slate-300">
                {visibleLogs.map((line) => (
                  <p
                    key={line}
                    className={
                      line.includes('[SYSTEM]')
                        ? 'text-emerald-400'
                        : line.includes('[TRACE]')
                          ? 'text-cyan-400'
                          : line.includes('[WARN]')
                            ? 'text-amber-400'
                            : 'text-slate-300'
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>

      <section className="mx-auto mb-6 max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-cyan-900/35 bg-[#03080f] px-5 py-6 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.14)] sm:px-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-white">Overall Progress</p>
              <p className="mt-1 text-sm text-slate-400">Estimated time remaining: {progressPercent >= 100 ? 0 : etaSeconds}s</p>
            </div>
            <p className="text-4xl font-extrabold text-cyan-400">{progressPercent}%</p>
          </div>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
            <div className="h-full rounded-full bg-cyan-400 transition-all duration-200" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-300">
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin text-slate-300" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            </svg>
            <p>{error || (progressPercent >= 100 ? 'Analysis complete. Preparing report...' : 'Analyzing secure tunnels and encryption layers...')}</p>
          </div>

          {error ? (
            <div className="mt-5 flex justify-center">
              <a href="/" className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-300 hover:border-cyan-500 hover:text-cyan-200">
                Go back and try again
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Scan

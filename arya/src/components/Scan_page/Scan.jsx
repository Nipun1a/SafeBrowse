import React from 'react'
import Navbar from '../Home/Navbar'
import Footer from '../Home/Footer'

const checks = [
  { label: 'Analyzing URL structure', status: 'QUEUED', icon: 'globe' },
  { label: 'Checking malware databases', status: 'QUEUED', icon: 'shield' },
  { label: 'Scanning reputation engines', status: 'QUEUED', icon: 'search' },
  { label: 'Validating SSL certificate', status: 'QUEUED', icon: 'lock' },
  { label: 'Generating Trust Score', status: 'QUEUED', icon: 'pulse' },
]

const StepIcon = ({ type }) => {
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
                <span className="text-cyan-400">https://digital-nexus-secure.io/gateway/v4</span>
              </p>

              <div className="relative mt-10 h-[360px] w-[360px] max-w-full">
                <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-900/40" />
                <div className="absolute left-1/2 top-1/2 h-[292px] w-[292px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-600/50 border-dashed" />
                <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-950/20" />
                <div className="absolute left-1/2 top-[20px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan-400" />
                <div className="absolute left-1/2 top-[28px] h-[88px] w-[2px] -translate-x-1/2 bg-cyan-400/90" />

                <div className="absolute left-1/2 top-1/2 h-[96px] w-[96px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/60 bg-slate-800/80 shadow-[0_0_45px_rgba(14,165,233,0.18)]">
                  <div className="flex h-full items-center justify-center text-cyan-400">
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
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-semibold leading-tight text-cyan-300">Initializing Neural Engine</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">PROCESSING...</p>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-5">
                {checks.map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300">
                      <StepIcon type={item.icon} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold leading-tight text-slate-200">{item.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.status}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl border border-cyan-900/45 bg-black/40 p-4 font-mono text-xs leading-6 text-slate-300">
                <p className="text-emerald-400">[SYSTEM] Hooking network interface...</p>
                <p>[INFO] Requesting header data from target host</p>
                <p>[AUTH] AI Credentials validated via GuardLink-Auth</p>
                <p className="text-cyan-400">[TRACE] Tracing hops: 12ms, 45ms, 22ms</p>
                <p>[WARN] SSL/TLS cipher: TLS 1.2 deprecated</p>
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
              <p className="mt-1 text-sm text-slate-400">Estimated time remaining: 8s</p>
            </div>
            <p className="text-4xl font-extrabold text-cyan-400">12%</p>
          </div>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
            <div className="h-full w-[12%] rounded-full bg-cyan-400" />
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-300">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            </svg>
            <p>Analyzing secure tunnels and encryption layers...</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Scan



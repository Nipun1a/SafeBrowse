import React from 'react'

const Hero = () => {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-900/40 bg-[#03080f] p-6 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.18),0_30px_80px_-45px_rgba(6,182,212,0.4)] sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.12),transparent_40%),radial-gradient(circle_at_88%_70%,rgba(14,165,233,0.1),transparent_35%)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              AI Engine v4.3 Active
            </span>

            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Check If Any
              <br />
              Website Is
              <br />
              <span className="text-cyan-400">Safe</span> Before
              <br />
              You Click
            </h1>

            <p className="mt-5 max-w-lg text-sm text-slate-300 sm:text-base">
              Real-time AI-powered URL threat detection and enterprise-grade trust scoring
              platform for modern digital safety.
            </p>

            <div className="mt-7 flex w-full max-w-xl flex-col rounded-xl border border-cyan-500/20 bg-[#071320]/90 p-2 shadow-[0_0_0_1px_rgba(6,182,212,0.14),0_0_35px_rgba(8,145,178,0.22)] sm:flex-row">
              <input
                type="text"
                placeholder="https://example.com"
                className="h-12 flex-1 rounded-lg bg-transparent px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <button className="mt-2 h-12 rounded-lg bg-cyan-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:mt-0">
                Scan Website
              </button>
            </div>

            <button className="mt-5 inline-flex items-center rounded-md border border-cyan-800/50 bg-[#07111d] px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-500/60 hover:text-cyan-200">
              View Previous Report
            </button>

          </div>

          <div className="relative mx-auto hidden h-[360px] w-[360px] lg:block">
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-900/35" />
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-900/40" />
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-800/45" />

            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_50px_rgba(14,165,233,0.2)]">
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl" />
              <div className="relative flex h-full items-center justify-center">
                <div className="rounded-2xl border border-cyan-500/30 bg-[#07111d] p-4 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-10 w-10 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="absolute right-8 top-16 rounded-lg border border-cyan-800/50 bg-[#07111d] p-2 text-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.2)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <div className="absolute bottom-16 left-10 rounded-lg border border-cyan-800/50 bg-[#07111d] p-2 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.18)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 1 1 8 0v3" />
              </svg>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          </div>
        </div>
      </section>
    </main>
  )
}

export default Hero

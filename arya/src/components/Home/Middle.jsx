import React from 'react'

const pillars = [
  {
    title: 'Malware Detection',
    description:
      'Deep heuristic analysis and behavioral sandboxing to identify zero-day malware and trojan payloads hidden in site code.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Reputation Analysis',
    description:
      'Cross-referencing 40+ global blacklists including VirusTotal, Google Safe Browsing, and specialized dark-web trackers.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
      </svg>
    ),
  },
  {
    title: 'SSL Security Validation',
    description:
      'Comprehensive cryptographic audit of SSL/TLS handshakes, certificate authority validity, and cipher strength.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </svg>
    ),
  },
  {
    title: 'AI Brain Scoring',
    description:
      'Neural network processing of domain age, WHOIS records, and visual similarity to detect phishing and spoofing attempts.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 8v8" />
        <path d="M15 8v8" />
        <path d="M6 10a3 3 0 1 1 0 4" />
        <path d="M18 10a3 3 0 1 0 0 4" />
      </svg>
    ),
  },
]

const Middle = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 lg:pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Advanced Security Pillars</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">
          Our AI engine leverages four distinct diagnostic layers to provide a 360-degree security profile for any URL.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-2xl border border-cyan-900/30 bg-[#060c14] p-5 shadow-[inset_0_0_0_1px_rgba(8,145,178,0.1)] transition hover:-translate-y-1 hover:border-cyan-700/50 hover:shadow-[0_12px_35px_-20px_rgba(6,182,212,0.5)]"
          >
            <div className="inline-flex rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-300">
              {pillar.icon}
            </div>
            <h3 className="mt-5 text-xl font-bold leading-tight text-white">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{pillar.description}</p>
          </article>
        ))}
      </div>

      <div className="relative mt-12 overflow-hidden rounded-2xl border border-cyan-900/35 bg-gradient-to-r from-[#07111d] via-[#071724] to-[#08101a] p-6 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.18),0_25px_55px_-35px_rgba(6,182,212,0.45)] sm:mt-16 sm:p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h3 className="text-3xl font-extrabold text-white">Ready for One Step Ahead?</h3>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              Download the Extension and use it in your browser Directly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="/download-extension" className="rounded-md bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Download Extension
            </a>
            
          </div>
        </div>
      </div>
    </section>
  )
}

export default Middle

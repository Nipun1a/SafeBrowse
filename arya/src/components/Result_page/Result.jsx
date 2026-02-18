import React from 'react'
import Navbar from '../Home/Navbar'
import Footer from '../Home/Footer'

const resultCards = [
  {
    title: 'Threat Detection',
    description:
      'Analyzed URL against Google Safe Browsing and Microsoft SmartScreen databases for known phishing, malware, and social engineering threats.',
    contribution: '2%',
  },
  {
    title: 'Reputation Scan',
    description:
      'Cross-referenced URL with 68+ reputation engines including VirusTotal, AlienVault, and IBM X-Force to identify historical malicious behavior.',
    contribution: '3%',
  },
  {
    title: 'SSL Security Check',
    description:
      'Comprehensive validation of the SSL/TLS certificate chain, encryption strength, protocol versions, and potential vulnerabilities like Heartbleed.',
    contribution: '1%',
  },
]

const strengths = [
  'SSL Certificate is valid and issued by a trusted Authority (DigiCert).',
  'Domain age is 4+ years, indicating long-term stability.',
  'No known malware patterns detected in static code analysis.',
  'Global reputation engines report zero recent blacklisting.',
  'DNS records are correctly configured with DNSSEC active.',
]

const concerns = [
  'Web server version header is exposed, potentially leaking platform info.',
  'Multiple redirects detected (3) which can occasionally mask intent.',
  'Privacy policy page contains outdated GDPR contact information.',
]

const Result = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-2xl border border-cyan-900/35 bg-[#03080f] p-6 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.14)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Security Analysis Report</h1>
              <p className="mt-2 text-sm text-slate-400 sm:text-base">Generated on Oct 24, 2023 • Scan ID: GI-88291-XA</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-[#060d17] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-700 hover:text-cyan-300">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.7 10.7 15.3 6.3M8.7 13.3l6.6 4.4" />
                </svg>
                Share Link
              </button>
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-[#060d17] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-700 hover:text-cyan-300">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M4 20h16" />
                </svg>
                Export PDF
              </button>
              <button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                </svg>
                Re-scan Website
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-[#040a12] p-8 sm:p-10">
            <div className="mx-auto flex max-w-lg flex-col items-center">
              <div
                className="relative h-56 w-56 rounded-full"
                style={{
                  background:
                    'conic-gradient(#22e38b 0deg 338deg, #1f2937 338deg 360deg)',
                }}
              >
                <div className="absolute inset-[10px] rounded-full bg-[#040a12]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-7xl font-extrabold leading-none text-emerald-400">94</span>
                  <span className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Trust Score</span>
                </div>
              </div>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/45 bg-emerald-500/10 px-6 py-2 text-2xl font-semibold text-emerald-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
                </svg>
                Website Safe
              </div>

              <p className="mt-4 text-sm text-slate-300 sm:text-base">
                Analyzed URL: <span className="font-semibold text-slate-100">https://guardlink.ai/secure-gateway</span>
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resultCards.map((card) => (
              <article key={card.title} className="rounded-xl border border-slate-800 bg-slate-900/65 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-100">{card.title}</h3>
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950">Safe</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{card.description}</p>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <span>Risk Contribution</span>
                    <span>{card.contribution}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                    <div className="h-full w-[10%] rounded-full bg-emerald-400" />
                  </div>
                </div>

                <button className="mt-5 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300">View Technical Details</button>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
            <section className="rounded-xl border border-slate-800 bg-slate-900/65 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-bold text-slate-100">Why this score?</h3>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-400">Positive Signals (12)</span>
                  <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-red-400">Concerns (1)</span>
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
                      <span className="w-[85%] bg-emerald-400" />
                      <span className="w-[10%] bg-amber-400" />
                      <span className="w-[5%] bg-red-500" />
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-[10px] font-semibold uppercase text-slate-400">
                      <span>Safe (85%)</span>
                      <span>Uncertain (10%)</span>
                      <span>Risk (5%)</span>
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
                  <span className="text-slate-400">Domain Age</span>
                  <span className="font-semibold text-slate-100">4 Years, 2 Months</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Server Location</span>
                  <span className="font-semibold text-slate-100">United States</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">IP Address</span>
                  <span className="font-semibold text-cyan-400">104.21.32.148</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">CMS Detected</span>
                  <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-200">Next.js</span>
                </div>
              </div>

              <button className="mt-8 w-full rounded-md border border-slate-700 bg-[#0a1018] py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-700 hover:text-cyan-300">
                View Full WHOIS Data
              </button>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Result

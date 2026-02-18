import React from 'react'
import Navbar from '../Home/Navbar'
import Footer from '../Home/Footer'

const scoreBands = [
  {
    range: '85 - 100',
    status: 'Very Safe',
    meaning: 'No major risk signals detected',
    color: 'bg-emerald-400',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
  },
  {
    range: '70 - 84',
    status: 'Safe',
    meaning: 'Minor warnings, low risk',
    color: 'bg-green-400',
    border: 'border-green-500/40',
    text: 'text-green-300',
  },
  {
    range: '50 - 69',
    status: 'Moderate Risk',
    meaning: 'Some suspicious indicators',
    color: 'bg-yellow-400',
    border: 'border-yellow-500/40',
    text: 'text-yellow-300',
  },
  {
    range: '30 - 49',
    status: 'Risky',
    meaning: 'Multiple risk signals',
    color: 'bg-orange-400',
    border: 'border-orange-500/40',
    text: 'text-orange-300',
  },
  {
    range: '0 - 29',
    status: 'Dangerous',
    meaning: 'High probability of malicious activity',
    color: 'bg-red-500',
    border: 'border-red-500/40',
    text: 'text-red-300',
  },
]

const signals = [
  'Threat intelligence checks (known phishing, malware, blacklists)',
  'Domain and hosting reputation (age, history, abuse reports)',
  'SSL/TLS validation (certificate trust, encryption quality)',
  'URL and page behavior patterns (redirect chains, suspicious scripts)',
  'Content and structure clues (impersonation, spoofing, social-engineering hints)',
]

const actions = [
  {
    level: 'Very Safe / Safe',
    note: 'Generally okay to continue, but still verify sensitive actions like payments and logins.',
  },
  {
    level: 'Moderate Risk',
    note: 'Proceed carefully. Avoid entering passwords, card details, or downloading files until verified.',
  },
  {
    level: 'Risky / Dangerous',
    note: 'Do not continue. Leave the site, avoid downloads, and report or block the URL if possible.',
  },
]

const About = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-2xl border border-cyan-900/40 bg-[#03080f] p-6 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.18),0_30px_80px_-45px_rgba(6,182,212,0.35)] sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(6,182,212,0.12),transparent_42%),radial-gradient(circle_at_82%_75%,rgba(14,165,233,0.1),transparent_36%)]" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">How SafeBrowse Detects Risk</h1>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-300 sm:text-base">
              SafeBrowse gives each website a trust score from 0 to 100. Higher scores mean lower risk. Lower scores mean
              stronger signs of phishing, malware, impersonation, or unsafe behavior. Use the score bands below to quickly
              understand how dangerous or safe a website may be.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Score Range</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {scoreBands.map((band) => (
                  <tr key={band.range} className={`rounded-lg border ${band.border} bg-[#0a111b]`}>
                    <td className="px-3 py-3 text-base font-semibold text-slate-100">{band.range}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-2 rounded-full border ${band.border} px-3 py-1 text-sm font-semibold ${band.text}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${band.color}`} />
                        {band.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">{band.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white">How The Score Is Decided</h2>
            <p className="mt-3 text-sm text-slate-300">
              The system combines multiple security checks. Each check contributes to the final risk score, then the score is
              mapped to a safety status.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {signals.map((signal) => (
                <li key={signal} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white">How To Read The Result</h2>
            <p className="mt-3 text-sm text-slate-300">
              Treat the score as a risk guide. It helps you decide whether to continue, verify more details, or avoid the
              website completely.
            </p>
            <div className="mt-4 space-y-4">
              {actions.map((action) => (
                <div key={action.level} className="rounded-lg border border-slate-700 bg-[#0b121c] p-4">
                  <p className="text-sm font-semibold text-slate-100">{action.level}</p>
                  <p className="mt-1 text-sm text-slate-300">{action.note}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About

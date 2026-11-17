import Navbar from '../Home/Navbar'
import Footer from '../Home/Footer'

const verdicts = [
  {
    range: '100',
    label: 'Malicious',
    meaning: 'Google or the configured OpenPhish feed flagged the URL, or at least three VirusTotal engines marked it malicious.',
    color: 'bg-red-400',
    border: 'border-red-500/40',
    text: 'text-red-300',
  },
  {
    range: '35–99',
    label: 'Suspicious',
    meaning: 'VirusTotal reported a suspicious or malicious finding below the malicious verdict threshold, or weighted risk signals reached the caution threshold with a usable reputation check.',
    color: 'bg-amber-400',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
  },
  {
    range: '50–99',
    label: 'Unknown',
    meaning: 'The scan had too little usable reputation evidence to reach a verdict. A missing, pending, or stale report can lead to this result.',
    color: 'bg-slate-400',
    border: 'border-slate-500/40',
    text: 'text-slate-300',
  },
  {
    range: '0–24',
    label: 'No known threats',
    meaning: 'Google found no match, a recent VirusTotal report showed no malicious or suspicious findings, and the other signals stayed below the caution threshold.',
    color: 'bg-emerald-400',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
  },
]

const signals = [
  'Google threat lists, VirusTotal reports, and the optional OpenPhish feed',
  'Public DNS and the domain registration date from RDAP',
  'HTTPS certificate trust, hostname match, and certificate age',
  'URL structure, lookalike domains when Tranco is configured, and redirects observed by VirusTotal',
]

const confidenceLevels = [
  { level: 'High', meaning: 'A Google or OpenPhish match, a recent VirusTotal report with at least three malicious findings, or consistent no-threat results from both Google and VirusTotal.' },
  { level: 'Medium', meaning: 'A suspicious result supported by a usable reputation check, or a malicious verdict based on an older VirusTotal report.' },
  { level: 'Low', meaning: 'The scan has limited evidence, such as one usable reputation source or an older suspicious report.' },
  { level: 'None', meaning: 'The scan had no usable reputation evidence for its Unknown verdict.' },
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
              SafeBrowse gives each submitted URL a risk score from 0 to 100. Higher scores indicate more risk or greater
              uncertainty. Read the verdict and confidence alongside the number. For example, a score of 50 can mean
              Suspicious when checks found warning signs, or Unknown when key evidence was unavailable.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th scope="col" className="px-3 py-2">Verdict</th>
                  <th scope="col" className="px-3 py-2">Risk score</th>
                  <th scope="col" className="px-3 py-2">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {verdicts.map((verdict) => (
                  <tr key={verdict.label} className={`rounded-lg border ${verdict.border} bg-[#0a111b]`}>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-2 rounded-full border ${verdict.border} px-3 py-1 text-sm font-semibold ${verdict.text}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${verdict.color}`} />
                        {verdict.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-base font-semibold text-slate-100">{verdict.range}</td>
                    <td className="px-3 py-3 text-sm text-slate-300">{verdict.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white">What affects the score</h2>
            <p className="mt-3 text-sm text-slate-300">
              Risk signals add weight to the score. Threat reports and missing evidence can also set a minimum score or
              determine the verdict. The scan report lists the signals that affected the result.
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
            <h2 className="text-2xl font-bold text-white">What confidence means</h2>
            <p className="mt-3 text-sm text-slate-300">
              Confidence describes how much reputation evidence supports the verdict. Even high-confidence results reflect
              the information available at the time of the scan.
            </p>
            <dl className="mt-4 space-y-4">
              {confidenceLevels.map(({ level, meaning }) => (
                <div key={level} className="rounded-lg border border-slate-700 bg-[#0b121c] p-4">
                  <dt className="text-sm font-semibold text-slate-100">{level}</dt>
                  <dd className="mt-1 text-sm text-slate-300">{meaning}</dd>
                </div>
              ))}
            </dl>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About

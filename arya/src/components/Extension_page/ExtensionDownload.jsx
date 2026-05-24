import React from 'react'
import Navbar from '../Home/Navbar'
import Footer from '../Home/Footer'

const steps = [
  'Click "Download ZIP" to download the SafeBrowse extension package.',
  'Extract the ZIP file on your computer.',
  'Open Chrome and go to chrome://extensions.',
  'Turn on "Developer mode" (top-right).',
  'Click "Load unpacked" and select the extracted extension folder.',
  'Pin SafeBrowse from the extensions menu and start scanning URLs.'
]

const ExtensionDownload = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-2xl border border-cyan-900/40 bg-[#03080f] p-6 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.18),0_30px_80px_-45px_rgba(6,182,212,0.4)] sm:p-10">
          <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Browser Protection
          </p>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Download SafeBrowse Extension</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-300 sm:text-base">
            Install the extension in Chrome and scan links directly while browsing.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/safebrowse-extension.zip"
              download
              className="rounded-md bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Download ZIP
            </a>
            <a
              href="/"
              className="rounded-md border border-cyan-700/60 px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-500 hover:text-cyan-200"
            >
              Back to Home
            </a>
          </div>

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/65 p-5 sm:p-6">
            <h2 className="text-2xl font-bold text-slate-100">How to Use</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-300 sm:text-base">
              {steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ExtensionDownload

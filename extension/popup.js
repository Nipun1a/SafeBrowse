// SafeBrowse Chrome Extension Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const screenLoading = document.getElementById('screen-loading');
  const screenResult = document.getElementById('screen-result');
  const screenError = document.getElementById('screen-error');
  const screenRestricted = document.getElementById('screen-restricted');
  
  const btnRescan = document.getElementById('btn-rescan');
  const btnRetry = document.getElementById('btn-retry');
  
  const loadingStep = document.getElementById('loading-step');
  const targetDomain = document.getElementById('target-domain');
  const loadingProgressBar = document.getElementById('loading-progress-bar');
  const loadingProgressText = document.getElementById('loading-progress-text');
  
  const scoreText = document.getElementById('score-text');
  const gaugeCircle = document.getElementById('gauge-circle');
  const verdictBadge = document.getElementById('verdict-badge');
  const verdictText = document.getElementById('verdict-text');
  const resultDomain = document.getElementById('result-domain');
  
  const googleStatus = document.getElementById('google-status');
  const vtStatus = document.getElementById('vt-status');
  const vtSummary = document.getElementById('vt-summary');
  const sslStatus = document.getElementById('ssl-status');
  const errorMessage = document.getElementById('error-message');

  // Backend endpoint configuration (production Vercel server)
  const backendApiUrl = 'https://safe-browse-nu.vercel.app/api';
  
  // Active URL placeholder
  let activeTabUrl = '';

  // Step names for visual scan flow
  const STEPS = [
    { threshold: 25, text: 'Analyzing URL structure...' },
    { threshold: 55, text: 'Querying Google Safe Browsing...' },
    { threshold: 75, text: 'Checking VirusTotal reputation...' },
    { threshold: 95, text: 'Validating SSL certificate & trust score...' }
  ];

  // Rescan & Retry Event Handlers
  btnRescan?.addEventListener('click', startScan);
  btnRetry?.addEventListener('click', startScan);

  // Initialize Scan on Extension Open
  startScan();

  function startScan() {
    showScreen(screenLoading);
    
    // Get Active Browser Tab URL
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          activeTabUrl = tabs[0].url;
          processUrl(activeTabUrl);
        } else {
          showError('Unable to query browser tab context.');
        }
      });
    } else {
      // Fallback for direct browser preview
      activeTabUrl = window.location.href;
      processUrl(activeTabUrl);
    }
  }

  function processUrl(urlString) {
    if (!urlString) {
      showScreen(screenRestricted);
      return;
    }

    // Restrict scan to http/https web pages only
    const isWebPage = urlString.startsWith('http://') || urlString.startsWith('https://');
    if (!isWebPage) {
      showScreen(screenRestricted);
      return;
    }

    let parsedDomain = 'Unknown Domain';
    try {
      const parsed = new URL(urlString);
      parsedDomain = parsed.hostname;
    } catch (e) {
      parsedDomain = urlString;
    }

    targetDomain.textContent = parsedDomain;
    runScanRequest(urlString, parsedDomain);
  }

  async function runScanRequest(url, domain) {
    let progress = 10;
    updateProgress(progress);

    // Simulated progress increment while waiting for API
    const progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += Math.floor(Math.random() * 5) + 3;
        if (progress > 90) progress = 90;
        updateProgress(progress);
      }
    }, 150);

    try {
      const scanEndpoint = `${backendApiUrl}/scan`;
      const response = await fetch(scanEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      clearInterval(progressInterval);
      updateProgress(100);

      // Transition to results viewport
      setTimeout(() => {
        renderResults(result.data, domain);
      }, 300);

    } catch (err) {
      clearInterval(progressInterval);
      console.error('Scan Request Error:', err);
      showError(err.message || 'The scan service is temporarily unavailable.');
    }
  }

  function updateProgress(value) {
    if (loadingProgressBar) loadingProgressBar.style.width = `${value}%`;
    if (loadingProgressText) loadingProgressText.textContent = `${value}%`;
    
    const currentStep = STEPS.find(s => value <= s.threshold);
    if (loadingStep) {
      loadingStep.textContent = currentStep ? currentStep.text : 'Finalizing analysis...';
    }
  }

  function renderResults(scanData, domain) {
    showScreen(screenResult);
    resultDomain.textContent = domain;
    
    const scoreRaw = Number(scanData?.score);
    const trustScore = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : 90;
    
    // Circle gauge math (circumference for r=48 is 301.6)
    const circumference = 301.6;
    const offset = circumference - (trustScore / 100) * circumference;
    
    // Animate the counter digits
    animateScoreCounter(trustScore);

    // Score categorization
    let tone = 'emerald';
    let statusLabel = 'Website Safe';
    
    if (trustScore >= 85) {
      tone = 'emerald';
      statusLabel = 'Website Safe';
    } else if (trustScore >= 70) {
      tone = 'green';
      statusLabel = 'Low Risk';
    } else if (trustScore >= 50) {
      tone = 'yellow';
      statusLabel = 'Moderate Risk';
    } else if (trustScore >= 30) {
      tone = 'orange';
      statusLabel = 'High Risk';
    } else {
      tone = 'red';
      statusLabel = 'Dangerous';
    }

    // Apply color tone to circular gauge stroke
    if (gaugeCircle) {
      gaugeCircle.style.strokeDashoffset = offset;
      gaugeCircle.className.baseVal = "transition-all duration-1000 ease-out";
      
      const colorClasses = {
        emerald: 'text-emerald-400',
        green: 'text-green-500',
        yellow: 'text-yellow-400',
        orange: 'text-orange-500',
        red: 'text-red-500'
      };
      gaugeCircle.classList.add(colorClasses[tone]);
    }

    // Verdict Badge update
    if (verdictText) verdictText.textContent = statusLabel;
    
    if (verdictBadge) {
      verdictBadge.className = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all';
      
      const badgeClasses = {
        emerald: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400',
        green: 'border-green-500/35 bg-green-500/10 text-green-400',
        yellow: 'border-yellow-500/35 bg-yellow-500/10 text-yellow-400',
        orange: 'border-orange-500/35 bg-orange-500/10 text-orange-400',
        red: 'border-red-500/35 bg-red-500/10 text-red-400'
      };
      verdictBadge.classList.add(...badgeClasses[tone].split(' '));
    }

    // Bind sub-verdicts
    const threatDetails = scanData?.threatDetails || {};
    
    // 1) Google Safe Browsing Status
    if (googleStatus) {
      const googleVerdict = (threatDetails?.googleSafeBrowsing || 'unknown').toLowerCase();
      googleStatus.textContent = googleVerdict;
      googleStatus.className = 'rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide';
      
      if (googleVerdict === 'clean') {
        googleStatus.classList.add('bg-emerald-500/10', 'text-emerald-400');
      } else if (googleVerdict === 'unknown') {
        googleStatus.classList.add('bg-slate-900', 'text-slate-400');
      } else {
        googleStatus.classList.add('bg-rose-500/10', 'text-rose-400');
      }
    }

    // 2) VirusTotal Status
    const vtMalicious = threatDetails?.virusTotal?.malicious ?? 0;
    const vtHarmless = threatDetails?.virusTotal?.harmless ?? 0;
    if (vtSummary) vtSummary.textContent = `${vtMalicious} flagged / ${vtHarmless} clean`;
    
    if (vtStatus) {
      vtStatus.className = 'rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide';
      if (vtMalicious > 0) {
        vtStatus.textContent = 'RISK';
        vtStatus.classList.add('bg-rose-500/10', 'text-rose-400');
      } else {
        vtStatus.textContent = 'SAFE';
        vtStatus.classList.add('bg-emerald-500/10', 'text-emerald-400');
      }
    }

    // 3) SSL Certificate Status
    if (sslStatus) {
      const sslValid = !!threatDetails?.sslValid;
      sslStatus.className = 'rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide';
      if (sslValid) {
        sslStatus.textContent = 'VALID';
        sslStatus.classList.add('bg-emerald-500/10', 'text-emerald-400');
      } else {
        sslStatus.textContent = 'INVALID';
        sslStatus.classList.add('bg-rose-500/10', 'text-rose-400');
      }
    }
  }

  function animateScoreCounter(targetScore) {
    if (!scoreText) return;
    let current = 0;
    if (targetScore === 0) {
      scoreText.textContent = '0';
      return;
    }
    const duration = 1000;
    const stepsCount = 50;
    const increment = targetScore / stepsCount;
    const stepTime = duration / stepsCount;
    
    const counterInterval = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        scoreText.textContent = Math.round(targetScore);
        clearInterval(counterInterval);
      } else {
        scoreText.textContent = Math.round(current);
      }
    }, stepTime);
  }

  function showError(msg) {
    showScreen(screenError);
    if (errorMessage) errorMessage.textContent = msg;
  }

  function showScreen(screen) {
    if (screenLoading) screenLoading.classList.add('hidden');
    if (screenResult) screenResult.classList.add('hidden');
    if (screenError) screenError.classList.add('hidden');
    if (screenRestricted) screenRestricted.classList.add('hidden');
    
    screen?.classList.remove('hidden');
  }
});

# SafeBrowse

SafeBrowse evaluates public HTTP and HTTPS URLs with Google threat lists, VirusTotal reputation, public DNS, TLS certificates, RDAP registration dates, and URL structure. Configure a Tranco CSV to enable brand and typosquatting comparisons. Set `OPENPHISH_FEED_PATH` to an updated, licensed OpenPhish text feed to enable exact URL matches. The feed is reloaded periodically and expires 24 hours after the file was updated. Redirect signals use VirusTotal's observed redirect metadata. The application does not download page contents or execute scripts from submitted URLs.

The risk score runs from 0 to 100, with higher scores indicating more risk. Results include a verdict, confidence, and evidence. A Google threat match or at least three malicious VirusTotal engine results takes priority. No known threats requires a Google no-match and a recent, usable VirusTotal report. An unknown score represents uncertainty.

## Run locally

Use Node.js 22. Install dependencies with `npm --prefix backend ci` and `npm --prefix arya ci`. Copy `backend/.env.example` to `backend/.env` and fill in your keys. Start the backend with `npm --prefix backend start` and the frontend with `npm --prefix arya run dev` in a second terminal.

Google and VirusTotal receive submitted URLs. Only submit public links you are comfortable sharing. VirusTotal looks up the URL first and submits public targets on a 404. Set `VIRUSTOTAL_SUBMIT_UNKNOWN=false` for lookups only. A submission can take longer than the scan deadline and may appear as pending.

## Redis

Use the Redis URL from your provider. Use `rediss://` for TLS, with the host, port and ACL credentials supplied by that service. For disposable local development with Docker running:

```powershell
docker run --rm --name safebrowse-redis -p 127.0.0.1:6379:6379 redis:7-alpine
docker exec safebrowse-redis redis-cli ping
```

Set `REDIS_URL=redis://127.0.0.1:6379` in `backend/.env` for this local instance. Startup logs report whether Redis is ready, disabled, or unavailable. The scanner continues with its local cache and a per-process VirusTotal quota if Redis is unavailable. With Redis connected, all instances sharing the key enforce a rolling 4 requests per minute and 500 per day across lookups, submissions, and polls.

## Test and evaluate

```powershell
npm --prefix backend test
npm --prefix arya run lint
npm --prefix arya run build
$env:RUN_LIVE_GOOGLE = '1'
node --env-file=backend/.env --test backend/test/scan.test.js
```

The opt-in Google test checks official test paths. Load `extension/` unpacked in Chrome to test the extension against its configured backend.

To evaluate up to 100 unique URLs per class, download the [OpenPhish community text feed](https://www.openphish.com/phishing_feeds.html) and extract the [Tranco ranking CSV](https://tranco-list.eu/). Pass the paths to the evaluator:

```powershell
node backend/scripts/evaluate.js openphish.txt top-1m.csv
```

The evaluator uses Google, DNS, RDAP and URL heuristics without opening connections to target websites. It always disables OpenPhish lookup because that feed supplies the phishing labels. Add `--with-vt` for paced VirusTotal lookups of existing reports. That mode takes at least 50 minutes for 200 URLs under the free quota. MALICIOUS and SUSPICIOUS count as detections. UNKNOWN counts as a missed detection on phishing samples and is also reported separately. Popularity is used as a proxy label for the benign set.

See [the deployment guide](DEPLOYMENT.md) for Vercel configuration.

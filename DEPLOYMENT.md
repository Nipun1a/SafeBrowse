# SafeBrowse on Vercel

Use the existing two Vercel projects with Node.js 22. The backend project root is `backend` (Express function at `api/index.js`). The frontend project root is `arya` (Vite). Sign in with `vercel login` and link each directory to its existing project before deploying.

## Backend environment

| Variable | Purpose |
| --- | --- |
| `GOOGLE_WEB_RISK_API_KEY` | Fallback Google lookup when the v4 key is unset. Enable Web Risk in its Google Cloud project. |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Google v4 lookup for noncommercial use. Google has deprecated v4. |
| `VIRUSTOTAL_API_KEY` | Optional v3 reputation. By default, a report miss triggers submission and bounded polling. The public plan is intended for noncommercial use and has a low quota. |
| `REDIS_URL` | Optional shared cache and VirusTotal quota enforcement. Use a reachable TLS URL for managed Redis. |
| `VIRUSTOTAL_SUBMIT_UNKNOWN` | Set to `false` for lookups only. |
| `TRANCO_LIST_PATH` | Optional path to an extracted Tranco CSV included in the deployed backend. |
| `OPENPHISH_FEED_PATH` | Optional path to a fresh, licensed OpenPhish feed file. |
| `MONGO_URI` | Optional shared cache with TTL expiry. |

Store credentials in Vercel's backend environment settings. Provider checks show as unavailable when their keys are absent or their requests fail. DNS, URL structure and standard HTTPS certificate checks still run. Scans can share the submitted URL with configured reputation providers. Configured caches store the normalized URL without its fragment.

- [Google Web Risk Lookup](https://docs.cloud.google.com/web-risk/docs/lookup-api)
- [Google Safe Browsing v4](https://developers.google.com/safe-browsing/v4)
- [VirusTotal API plans and quota](https://docs.virustotal.com/docs/api-overview)

## Deploy and smoke-test

1. Deploy the backend preview and test `POST /api/scan` with `{"url":"https://example.com/"}`. Confirm the response has `data.verdict` and individual check statuses. Repeat the request to verify caching where available.
2. The built frontend sends scans to its own `/api/scan` path. The rewrite in `arya/vercel.json` proxies that request to the public backend at `https://safe-browse-nu.vercel.app`. Frontend previews also use this rewrite. Update its destination before building a preview against a different backend. `VITE_API_BASE_URL` applies to local Vite development only.
3. Deploy the frontend preview, submit the same URL, and verify the report. Submit an invalid URL and confirm the UI displays the API error. Test the unpacked extension after the production backend is updated.
4. Promote the tested backend and frontend to production. If the production backend hostname changes, update the frontend rewrite and the extension's API URL and host permission, then rebuild the extension ZIP.

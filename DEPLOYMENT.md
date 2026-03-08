# SafeBrowse Vercel Deployment

## Architecture
- `arya/`: React + Vite frontend
- `backend/`: Express API (serverless on Vercel)

## 1) Deploy Backend (`backend/`) on Vercel
1. Create a new Vercel project and set **Root Directory** to `backend`.
2. Framework preset: `Other`.
3. Build/Output settings: keep default (Vercel will use `backend/vercel.json` + `api/index.js`).
4. Add environment variables:
- `MONGO_URI` (required)
- `GOOGLE_SAFE_BROWSING_API_KEY` (required)
- `VIRUSTOTAL_API_KEY` (required)
- `REDIS_URL` (optional; app works without Redis cache)
5. Deploy and copy backend URL, for example: `https://safebrowse-api.vercel.app`.

## 2) Deploy Frontend (`arya/`) on Vercel
1. Create another Vercel project and set **Root Directory** to `arya`.
2. Framework preset: `Vite`.
3. Add environment variable:
- `VITE_API_BASE_URL=https://<your-backend-domain>/api`
4. Deploy.

## 3) Post-deploy checks
1. Open frontend and run a scan from homepage.
2. Confirm request succeeds at `POST https://<backend-domain>/api/scan`.
3. Confirm result page loads and displays live scan payload.

## Local development
- Frontend: `cd arya && npm run dev`
- Backend: `cd backend && npm start`
- Local frontend defaults to `http://localhost:5000/api`.

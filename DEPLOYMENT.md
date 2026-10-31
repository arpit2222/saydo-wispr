# SayDo Deployment Guide (Production Web & API)

This guide provides complete instructions to deploy **SayDo** to production:
1. **API Backend**: Deployed on **Railway** (or Docker container / Nebius / Render).
2. **Web Frontend & Studio**: Deployed on **Vercel** with Next.js and embedded SayDo SDK.
3. **AI Intelligence Engine**: Powered by **Azure OpenAI** (`gpt-4o-mini` / `gpt-4o`) with automatic offline deterministic fallback.

---

## 1. Quick API Backend Deployment on Railway

1. **Open Railway**: Go to [railway.app](https://railway.app) and select **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. **Select Repo**: Choose `arpit2222/saydo-wispr`.
3. **Configure Service Settings**:
   - **Root Directory**: `/` (Leave as repository root so monorepo workspace dependencies like `@saydo/shared` are resolved).
   - **Dockerfile Path**: `apps/api/Dockerfile`
   - **Port**: `4000`
   - **Healthcheck Path**: `/v1/healthz`
4. **Set Environment Variables**:
   ```ini
   PORT=4000
   NODE_ENV=production
   AZURE_OPENAI_API_KEY=your_azure_openai_key
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
   AZURE_OPENAI_API_VERSION=2024-08-01-preview
   WEB_URL=https://your-app.vercel.app
   ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
   AGENT_TOKEN=saydo_secure_token_secret
   ```
5. **Generate Domain**: Click **Settings** $\rightarrow$ **Networking** $\rightarrow$ **Generate Domain** (e.g. `https://saydo-api-production.up.railway.app`).

---

## 2. Web & Studio Frontend Deployment on Vercel

1. **Import Project**: Go to [vercel.com/new](https://vercel.com/new) and select `arpit2222/saydo-wispr`.
2. **Framework Preset**: Next.js
3. **Root Directory**: `.`
4. **Build & Install Settings**:
   - Build Command: `pnpm run build`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`
5. **Set Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://saydo-api-production.up.railway.app` | Base URL of your deployed API backend |
   | `NEXT_PUBLIC_APP_PUBLIC_KEY` | `pk_demo_dehix` | Application public key for SayDo SDK |
6. Click **Deploy**.

---

## 3. Production Environment Variables Matrix

| Variable | Target | Required | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | API | Yes | Port to listen on (default `4000`) |
| `NODE_ENV` | API | Yes | `production` |
| `ALLOWED_ORIGINS` | API | Yes | Comma-separated CORS allowed domains (e.g. Vercel URL) |
| `WEB_URL` | API | Yes | Frontend host URL for write execution callbacks |
| `AZURE_OPENAI_API_KEY` | API | **Yes (for live AI)** | Azure OpenAI key for fast schema extraction & agent planning |
| `AZURE_OPENAI_ENDPOINT`| API | **Yes (for live AI)** | Azure endpoint (e.g. `https://<resource>.openai.azure.com/`) |
| `AZURE_OPENAI_DEPLOYMENT` | API | Optional | Deployment model name (defaults to `gpt-4o-mini`) |
| `AZURE_OPENAI_API_VERSION` | API | Optional | API version (defaults to `2024-08-01-preview`) |
| `AGENT_TOKEN` | API | Yes | Secret token for server-side MCP & agent execution |
| `NEXT_PUBLIC_API_URL` | Web | Yes | Production URL pointing the SDK and Studio to the API |
| `NEXT_PUBLIC_APP_PUBLIC_KEY` | Web | Yes | Application public key (`pk_demo_dehix`) |

> [!NOTE]
> **Zero-Dependency Fallback**: If `AZURE_OPENAI_API_KEY` is omitted, SayDo automatically activates its built-in deterministic neuro-symbolic engine so the entire judge demo and policy checks continue working without errors.

---

## 4. Health Checks & Verification

- **Liveness Probe**: `GET /v1/healthz` (Returns HTTP 200 `{ "status": "ok", "service": "saydo-api" }`)
- **AI Diagnostics**: `GET /v1/health/models` (Validates your Azure OpenAI connectivity, latency, and tool calling)
- **Proof Ledger**: `GET /proof` and `GET /proof/run-dehix-revamp-verified`

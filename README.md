<div align="center">
<h1>FlyerSpark — AI-Powered Marketing Assets (A LemmaIoT Product)</h1>
</div>

FlyerSpark is a lightweight, web-first tool that helps businesses generate, preview, and iterate high-quality marketing flyers and short-form content using state-of-the-art generative models.

Built and maintained by the LemmaIoT team, FlyerSpark is designed for small-to-medium businesses, marketing teams, and field operators who need fast, branded creative content without large design budgets.

Why FlyerSpark helps your business
- Save time: Quickly generate multiple flyer variants from simple input prompts and structured data.
- Reduce cost: Produce on-demand marketing assets without hiring external designers for every campaign.
- Increase consistency: Apply brand rules and templates so all outputs stay on-brand.
- Improve agility: Iterate ideas in minutes and push assets to campaigns or local printers.

Key features
- Prompt-driven generation with structured fields (headline, offer, CTA, contact)
- Live preview and export (PNG/PDF-ready layouts)
- Theme and brand switching for consistent colors, fonts, and logos
- Lightweight local-first web app — works for offline demos and internal tools

Quick start (developer)
Prerequisites: `Node.js` and an API key for your chosen generative model provider (set as `GEMINI_API_KEY` in a local env file).

1. Install dependencies:
   `npm install`
2. Add your API key to `.env.local` (create if missing):
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. Run the app for local development:
   `npm run dev`

Deployment notes
- The app is framework-agnostic and can be deployed to static hosts (Vercel, Netlify) or container platforms. Ensure your production environment provides the `GEMINI_API_KEY` securely (environment variables or secret manager).

How it works (brief)
- The UI collects user inputs and optional structured data (brand, offer details).
- FlyerSpark sends a short prompt to the configured generative model service and receives text and layout suggestions.
- The client renders a preview that can be refined, themed, and exported.

Business use cases
- Retail promotions and seasonal flyers
- Event one-pagers and local marketing
- Field teams producing posters or quick handouts
- Rapid A/B variants for digital ads

Support and contribution
- Product: LemmaIoT (Lemma IoT Service)
- Issues and feature requests: open a GitHub issue in this repository
- For enterprise integrations, custom templates, or consulting, contact the LemmaIoT team through your usual LemmaIoT channels.

License
- This project is provided under the terms chosen by the repository owner — check the `LICENSE` file or repository settings for details.

Thank you for using FlyerSpark — quick, branded marketing assets powered by AI and crafted for business use.

Deployment: GitHub + Netlify (recommended)
-------------------------------------

This repository is ready to be hosted on GitHub and automatically deployed to Netlify. The repository contains a `netlify.toml` with the build command for a Vite app and a GitHub Actions workflow that runs on `push` to `main`/`master`.

1) Create a GitHub repository and push your code

From Windows PowerShell in the project root run:

```powershell
git init
git add .
git commit -m "Initial commit: FlyerSpark"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

2) Netlify setup options

- Option A — Recommended (Netlify site + GitHub integration):
   1. In Netlify, create a new site and connect your GitHub repository. Choose the `main` branch and set the build command to `npm run build` and publish directory to `dist`. Add any build environment variables (see section below).

- Option B — Use GitHub Actions (CI deploy):
   1. This repository includes a GitHub Actions workflow `.github/workflows/deploy-to-netlify.yml` that builds and deploys using the Netlify CLI. You must add the following repository secrets in GitHub: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.

3) Required environment variables / secrets

- `GEMINI_API_KEY` — model provider API key (add on Netlify under Site settings > Build & deploy > Environment or as a GitHub secret for CI).
- `NETLIFY_AUTH_TOKEN` — personal access token from Netlify (only needed for CLI deploys/GitHub Actions).
- `NETLIFY_SITE_ID` — the target Netlify site ID for CLI deploys.

Create a local `.env.local` for development (not checked into git):

```env
GEMINI_API_KEY=your_api_key_here
```

4) Netlify CLI quick deploy (local)

Install and login locally (optional):

```powershell
npm install -g netlify-cli
netlify login
netlify deploy --dir=dist --prod
```

Notes on secrets and security
- Never commit `.env.local` or your API keys to the repository. Use `.env.example` as a reference and add `.env.local` to `.gitignore` if it's not already ignored.
- For CI deployments, set secrets in GitHub (Repository > Settings > Secrets > Actions). For direct Netlify Git integration, set environment variables in Netlify's site settings.

If you'd like, I can also:
- Add `.gitignore` entries if missing (e.g., `.env.local`, `node_modules`, `dist`).
- Configure a friendly site banner and `CNAME` support for custom domains in `netlify.toml`.


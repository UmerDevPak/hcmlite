# HCM Lite — Deployment Guide (Vercel & GitHub)

This project is configured, tested, and optimized for seamless zero-config deployment to **Vercel** and **GitHub**.

---

## Production Verification Summary

- **Framework**: Next.js 14 (App Router)
- **Production Build Status**: Verified (`next build` compiled cleanly with 26/26 routes prerendered)
- **Deployment Config**: [`vercel.json`](./vercel.json) initialized
- **Environment Template**: [`.env.example`](./.env.example) ready with production Firebase credentials

---

## Method 1: Push to GitHub & Deploy on Vercel (Recommended)

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `hcm-lite`).
3. Leave it **Empty** (do not initialize with README or license since this project is already initialized).
4. Click **Create repository**.

### Step 2: Link and Push from Your Terminal
Run these two commands in this project folder:

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

*(If you already have your GitHub repo URL, you can also paste it in the chat and I can link and push it for you!)*

---

### Step 3: Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your GitHub account and click **Import** next to your `hcm-lite` repository.
3. Under **Environment Variables**, paste the following keys:

| Environment Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBw_4gwAjNQLeWkU0z9ByiD-AMfODqBHgw` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `fir-auth-fa91c.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `fir-auth-fa91c` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `fir-auth-fa91c.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `651229386085` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:651229386085:web:afb60eb60e4176fe23bd8c` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-FR58F1CZK4` |
| `NEXT_PUBLIC_USE_DEMO_DATA` | `false` |

4. Click **Deploy**.
5. In ~45 seconds, your live production application will be live at `https://<your-app>.vercel.app` with instant global CDN and automated SSL!

---

## Method 2: Deploy Directly to Vercel via CLI

If you prefer to deploy directly from your machine using the Vercel CLI:

```bash
# 1. Login to Vercel
npx vercel login

# 2. Deploy preview
npx vercel

# 3. Deploy to production
npx vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? Select your personal or team account
- Link to existing project? **No**
- What's your project's name? `hcm-lite`
- In which directory is your code located? `./`
- Want to modify these settings? **No**

---

## Default Production Credentials

When accessing your live deployment:

- **Super Admin**: `admin@hcmlite.internal` (Password: `Password123!`)
- **HR Operations**: `hr@hcmlite.internal` (Password: `Password123!`)
- **Employee**: `employee@hcmlite.internal` (Password: `Password123!`)
- **1-Click Evaluation**: You can also use the **Instant Demo Personas** buttons on `/login`.

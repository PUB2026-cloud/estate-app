# ESTĀTE — Property Intelligence App

A full-featured real estate search app with live data, map view, price history, comps, and neighborhood scores.

---

## 🚀 Quick Start (5 minutes)

### Step 1 — Install Node.js
Download from https://nodejs.org (choose "LTS" version). Install it like any app.

### Step 2 — Get your API keys

**Rentcast** (property listings + AVM) — Required for live data
1. Go to https://app.rentcast.io/app
2. Sign up → go to API section
3. Copy your API key (~$30/mo, free trial available)

**Walk Score** (neighborhood scores) — Optional, free tier
1. Go to https://www.walkscore.com/professional/api.php
2. Sign up for free API key

### Step 3 — Set up the project

Open Terminal (Mac: Cmd+Space → type "Terminal") or Command Prompt (Windows).

```bash
# Go to the estate-app folder (wherever you saved it)
cd path/to/estate-app

# Copy the environment file
cp .env.example .env

# Open .env in a text editor and paste your API keys
# (or use: nano .env  or  notepad .env)

# Install dependencies
npm install

# Start the app
npm run dev
```

Then open your browser to: **http://localhost:3000**

---

## 📱 Features

- **Multi-ZIP search** — Search across multiple area codes simultaneously
- **Live listings** — Real property data from Rentcast API
- **Map view** — Property pins + ZIP code boundary overlays
- **Price history** — 12-month price trends with AVM estimates
- **Sales comps** — Comparable recent sales
- **Neighborhood scores** — Walk/Transit/Bike scores
- **Save favorites** — Heart properties, compare side-by-side
- **Filters** — Price, size, property type, bedrooms, sort order

---

## 🌐 Deploy publicly (share with others)

### Option A: Vercel (recommended, free)
1. Push this folder to GitHub (github.com → New Repository)
2. Go to vercel.com → Import your GitHub repo
3. Add environment variables (VITE_RENTCAST_API_KEY etc.) in Vercel dashboard
4. Deploy — you get a public URL like `https://estate-yourname.vercel.app`

### Option B: Netlify (also free)
1. Go to netlify.com → "Add new site" → "Import from Git"
2. Connect your GitHub repo
3. Add env vars under Site Settings → Environment Variables
4. Deploy

---

## 🗂 Project Structure

```
estate-app/
├── src/
│   ├── App.jsx                 # Main layout & state
│   ├── components/
│   │   ├── SearchPanel.jsx     # Left sidebar filters
│   │   ├── PropertyCard.jsx    # Grid listing card
│   │   ├── PropertyMap.jsx     # Leaflet map
│   │   ├── PropertyDetail.jsx  # Right drawer (history, comps, neighborhood)
│   │   └── FavoritesPanel.jsx  # Saved properties
│   ├── hooks/
│   │   └── useFavorites.js     # Favorites persistence
│   └── utils/
│       ├── api.js              # All API calls (Rentcast, geocoding, Walk Score)
│       └── formatters.js       # Price/size formatting helpers
├── .env                        # Your API keys (never commit this!)
├── .env.example                # Template for keys
└── package.json
```

---

## 🔑 API Reference

| Service | Used For | Cost | Key Location |
|---------|----------|------|--------------|
| Rentcast | Listings, AVM, comps | ~$30/mo | VITE_RENTCAST_API_KEY |
| OpenStreetMap | Map tiles | Free | No key needed |
| Nominatim | Geocoding + ZIP boundaries | Free | No key needed |
| Walk Score | Neighborhood scores | Free tier | VITE_WALKSCORE_API_KEY |

---

## ❓ Troubleshooting

**"Search failed. Check your Rentcast API key."**
→ Open `.env`, make sure `VITE_RENTCAST_API_KEY=` has your actual key (no quotes)
→ Restart the dev server after changing .env: Ctrl+C then `npm run dev`

**Map not showing / blank**
→ Check browser console for errors. Leaflet requires internet access for tiles.

**No results for a ZIP code**
→ Rentcast doesn't have 100% coverage. Try major metro ZIP codes first (10001, 90210, etc.)

# Rua Frontend

## Setup (run locally)

Teammates can get the app running with:

```bash
git clone <repo>
cd frontend
npm install
npm run dev
```

Then open the URL shown in the terminal (e.g. `http://localhost:5173`).  
If the frontend lives in a subfolder (e.g. `pothole-ai-system/frontend`), run `cd` into that folder instead of `frontend`.

- **Map:** If `VITE_MAPBOX_TOKEN` is set in a `.env` file, the map loads. Otherwise the app still runs and shows "Map loading…" where the map would be. Optional: copy `.env.example` to `.env` and add your [Mapbox access token](https://account.mapbox.com/) to enable the map.
- All dependencies are in `package.json`; `npm install` installs everything.

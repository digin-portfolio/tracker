# TV Tracker

TV Tracker is a personal movie and TV-show companion built with React and Vite. Browse trending entertainment, explore title details, track what you have watched, save favorites, rate titles, and write personal reviews.

The app works without an API key using built-in demo content. Connect TMDB to browse live movies, TV shows, K-dramas, anime, cast, trailers, and streaming-provider information.

## Features

- Browse trending movies and TV shows
- Browse Movies, TV, K-dramas, and Anime categories
- View title details, casts, trailers, seasons, and episodes
- Mark titles and episodes as watched
- See watch activity and live dashboard statistics
- Save favorites
- Add a personal 10-point rating to each title
- Write and save personal reviews
- Switch between light and dark themes
- Use offline fallback data when TMDB is not connected

Watch status, favorites, ratings, and reviews are saved locally in the browser. They belong to the browser profile you use and are not shared with other devices.

## Run locally

### Requirements

- Node.js 20 or later
- npm

### Setup

1. Open a terminal in this folder.
2. Install the project packages:

   ```bash
   npm install
   ```

3. Start the local app:

   ```bash
   npm run dev
   ```

4. Open the address shown in the terminal, usually `http://localhost:5173`.

## Connect TMDB (optional)

1. Create an API key in your [TMDB account settings](https://www.themoviedb.org/settings/api).
2. Copy `.env.example` to a new file named `.env`.
3. Update the value in `.env`:

   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. Restart the local app.

For a production deployment, use the secure Supabase Edge Function proxy described below instead of adding a TMDB key to the browser.

`.env` is excluded from Git to prevent accidental commits. Do not put a real API key in `.env.example`.

## Secure TMDB proxy

The app includes a Supabase Edge Function at `supabase/functions/tmdb-proxy/index.ts`. Deploy it through the Supabase Dashboard or CLI, then add a Supabase Edge Function secret named `TMDB_API_KEY` with your TMDB v3 key. The proxy accepts requests only from authenticated users, allows only the endpoints used by this app, applies a per-instance request limit, and caches successful responses for five minutes.

## Available commands

```bash
npm run dev      # Start the local development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
npm run lint     # Check the code for lint issues
```

## Deploy

### Vercel

1. Push the project to a Git provider.
2. Import the repository in Vercel.
3. Use the default Vite build command: `npm run build`.
4. Set the output directory to `dist`.
5. Add `VITE_TMDB_API_KEY` in the project's environment variables if you want live TMDB data.

### Netlify

1. Create a new site from the project repository.
2. Set the build command to `npm run build`.
3. Set the publish directory to `dist`.
4. Add `VITE_TMDB_API_KEY` in the site environment settings if needed.

Because this is a browser-based app, a `VITE_` environment variable is included in the generated client code. For a production system that needs secret credentials, move API requests behind your own backend or serverless function.

## Technology

- React 19
- Vite
- React Router
- Framer Motion
- Lucide icons
- TMDB API

## Project structure

```text
src/
  components/   Shared UI and layout components
  lib/          TMDB API and browser-storage helpers
  pages/        Application pages and styles
public/         Static assets
```

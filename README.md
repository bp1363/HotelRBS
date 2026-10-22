# HotelRBS - Hotel Booking Platform

A hotel booking web app built with React, TypeScript and Vite. It lets users search hotels, view details on a map, and complete a booking, using live data from the Travzilla Hotel API.

## Features

- Search hotels by destination, dates and guests
- Hotel details: amenities, policies, location
- Booking flow with guest information
- Interactive map (Mapbox)
- Responsive UI (Tailwind CSS, Radix UI, shadcn/ui)

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Radix UI, shadcn/ui
- **Data fetching:** TanStack Query
- **Maps:** Mapbox GL JS
- **Proxy server:** Express.js (forwards requests to the Travzilla API and keeps credentials server-side)

## Prerequisites

- Node.js v18+
- npm or yarn
- Mapbox access token
- Travzilla API credentials

## Setup

```bash
git clone https://github.com/<your-username>/hotel-rbs-showcase-58.git
cd hotel-rbs-showcase-58
npm install
cp .env.example .env
```

Edit `.env`:

```env
# Proxy server (server-side only, never exposed to the browser)
API_BASE_URL=your_api_base_url
API_USERNAME=your_api_username
API_PASSWORD=your_api_password
PROXY_SERVER_PORT=3001

# Frontend (Vite)
VITE_PROXY_SERVER_URL=http://localhost:3001/api
VITE_MAPBOX_TOKEN=your_mapbox_token
```

> Do not put API credentials in `VITE_` variables. They get bundled into the frontend and become public.

## Run Locally

Start the proxy server and the frontend in two terminals:

```bash
# Terminal 1
node proxy-server.js

# Terminal 2
npm run dev
```

- Frontend: http://localhost:8080
- Proxy: http://localhost:3001

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |

## Project Structure

```
src/
  components/   React components
  pages/        Page components
  services/     API services
  hooks/        Custom hooks
  data/         Static data
  lib/          Utilities
proxy-server.js  Express proxy for the Travzilla API
.env.example     Environment variable template
```

## API Endpoints (via proxy)

- `/api/hotel-search`: search hotels by destination and dates
- `/api/hotel-details`: details for a single hotel

## Deployment

- **Frontend:** Vercel, Netlify or any static host
- **Proxy server:** Railway, Render, Heroku or any Node.js host

Set the same environment variables (without `.env`) in your hosting dashboard.

## Troubleshooting

- **CORS errors:** make sure the proxy server is running on port 3001
- **API errors:** check the credentials in `.env`
- **Map not loading:** check `VITE_MAPBOX_TOKEN`

## Author

Braj Pal Singh: [GitHub](https://github.com/bp1363) · [LinkedIn](https://linkedin.com/in/brajpal-singh-2098a8157)

## License

MIT

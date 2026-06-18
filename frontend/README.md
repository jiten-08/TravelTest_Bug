# TravelTest Frontend

TravelTest is a travel booking web application frontend for Selenium automation practice. This first step contains the React + Vite + Tailwind base setup, routing, layout, home page, 404 page, local JSON sample data, and placeholder Axios service methods for a future Django REST API.

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Axios

## Project Structure

```text
frontend/
  src/
    assets/
    components/
    context/
    data/
    layouts/
    pages/
    routes/
    services/
    utils/
```

## Setup

```bash
npm install
npm run dev
```

The app runs on:

```text
http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## API Placeholder

The frontend currently reads sample JSON from `src/data`. `src/services/api.js` is prepared for future Django REST Framework endpoints and JWT authorization using `localStorage`.

Set the backend URL later with:

```bash
VITE_API_BASE_URL=https://traveltest-bug.onrender.com/api
```

## Selenium Practice Convention

Important interactive and visible elements should use stable `data-testid` attributes. This convention is already applied to the base layout and pages and should continue as new modules are added.

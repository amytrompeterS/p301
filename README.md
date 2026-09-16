# Toy Store Operations Dashboard

A single-page retail operations dashboard for the Chicago location of a national toy store chain. It gives operations leaders a quick view of annual performance, monthly changes, and the products driving sales.

## Features

- Light Vuetify theme with a responsive layout for desktop and mobile.
- Month picker in the app bar, defaulting to `All`.
- Summary cards for sales, foot traffic, promo lift, and inventory turn.
- Month-over-month change indicators with directional arrows and color.
- Top 10 and lowest 10 SKU views, ranked by estimated revenue.
- Revenue trend area chart powered by Chart.js.
- Focused month views show the selected month alongside nearby months.
- All data is local; the app does not make API calls.

## Tech Stack

- Vue 3 with `<script setup>` and TypeScript
- Vite
- Vuetify 4 and Material Design Icons
- Chart.js via `vue-chartjs`
- Local JSON data in `src/data/metrics.json`

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Vite will print the local development URL in the terminal, usually `http://localhost:5173`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and create a production build. |
| `npm run preview` | Preview the production build locally. |

## Data

The dashboard uses a generated 2025 dataset in [`src/data/metrics.json`](src/data/metrics.json). It contains:

- Annual summary values for revenue, orders, foot traffic, promo lift, inventory turn, average order value, and return rate.
- Monthly values for January through December 2025.
- SKU-level sales and trend data used by the ranking panel.

To update the dashboard data, edit the JSON file. The application imports it at build time, so no backend or environment variables are required.

## Project Structure

```text
src/
├── App.vue                  # Main dashboard and filtering logic
├── data/metrics.json        # Local annual, monthly, and SKU data
├── main.ts                  # Vue application entry point
├── plugins/vuetify.ts       # Vuetify theme and component setup
├── style.css                # Global dashboard styling
└── views/DashboardView.vue  # Additional dashboard view scaffold
```

The active page is mounted from `src/main.ts` and rendered by `src/App.vue`. The app is intentionally single-page and does not require routing for its primary workflow.

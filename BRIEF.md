# Retail Ops Dashboard 301- Project Brief

## What is this?
An operations leader at the Chicago location of a national toy store chain needs a dashboard to monitor business operations.

## Data
Generate a fake dataset as a JSON file (src/data/metrics.json). 
12 months of data (Jan-Dec 2025), each month containing:
- Sales by SKU (amount, trending upward with some variation)
- Foot Traffic (amount, seasonal pattern - higher in summer)
- Promo Lift (percentage, trending upward with some variation)
- Inventory Turn (amount, trending upward with some variation)

## Layout (Vuetify)
- v-app-bar at the top with the dashboard title and a month picker
- the month picker should default to showing ALL months
- When a specific month is select, all cards and charts filter to that month. When "All" is selected, show the full year
- Below the app bar: a row of 4 summary cards (v-cards) showing the key metrics: Sales by SKU, foot traffic, promo lift, inventory turn
- Below that: one full-width area chart shipment volume trend
- use v-container, v-row, v-col for responsive grid layout

## Interactions
- Month picker in the app bar filters EVERYTHING - summary cards show that month's number, charts highlight or filter to that month
- When "ALL" is selected, summary cards show yearly totals/averages and charts show all 12 months
- Cards show a small up/down arrow or color indicating change from the previous month

## Style
- light theme by default 
- clean, minimal, lots of whitespace
- charts should use a cohesive color palette of pastels, light colors
- mobile responsive - cards stack on small screens

## Tech
- Vue 3 + TypeScript + Vuetify 3
- Chart.js via vue-chartjs for all charts
- fake data from a local JSON file (no API calls)
- single page - no routing needed for this app

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
)

const summaryCards = [
  { title: 'Revenue', value: '$124.8k', change: '+12.4%', icon: 'mdi-cash-multiple', color: 'primary' },
  { title: 'Orders', value: '3,482', change: '+8.1%', icon: 'mdi-bag-personal', color: 'success' },
  { title: 'Inventory', value: '91.2%', change: '+2.6%', icon: 'mdi-package-variant', color: 'info' },
  { title: 'Returns', value: '1.4%', change: '-0.7%', icon: 'mdi-package-down', color: 'warning' },
]

const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [18, 24, 23, 31, 39, 43],
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.2)',
      tension: 0.35,
      fill: true,
    },
  ],
}

const salesByCategory = {
  labels: ['Plush', 'Blocks', 'Puzzles', 'STEM', 'Outdoor'],
  datasets: [
    {
      label: 'Units sold',
      data: [420, 360, 290, 250, 195],
      backgroundColor: ['#8b5cf6', '#f59e0b', '#10b981', '#38bdf8', '#f472b6'],
    },
  ],
}

const channelMix = {
  labels: ['Web', 'Retail', 'Marketplace', 'Wholesale'],
  datasets: [
    {
      data: [42, 28, 18, 12],
      backgroundColor: ['#7c3aed', '#10b981', '#f59e0b', '#38bdf8'],
    },
  ],
}

const revenueChartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: false, grid: { color: 'rgba(148, 163, 184, 0.2)' } },
    x: { grid: { display: false } },
  },
}))

const categoryOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
}))

const doughnutOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
}))
</script>

<template>
  <v-row class="mb-4" dense>
    <v-col v-for="card in summaryCards" :key="card.title" cols="12" sm="6" md="3">
      <v-card class="summary-card pa-4" elevation="0" border>
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <div class="text-caption text-medium-emphasis">{{ card.title }}</div>
            <div class="text-h5 font-weight-bold mt-1">{{ card.value }}</div>
          </div>
          <v-avatar :color="card.color" size="42">
            <v-icon color="white" :icon="card.icon" />
          </v-avatar>
        </div>
        <div class="text-body-2" :class="card.change.startsWith('-') ? 'text-error' : 'text-success'">
          {{ card.change }} vs last month
        </div>
      </v-card>
    </v-col>
  </v-row>

  <v-row dense>
    <v-col cols="12" lg="8">
      <v-card class="pa-4" elevation="0" border>
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <div class="text-overline text-medium-emphasis">Sales</div>
            <div class="text-h6 font-weight-bold">Revenue trend</div>
          </div>
          <v-chip color="primary" variant="tonal">Updated 2h ago</v-chip>
        </div>

        <div class="chart-shell">
          <Line :data="revenueData" :options="revenueChartOptions" />
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card class="pa-4" elevation="0" border>
        <div class="text-overline text-medium-emphasis">Distribution</div>
        <div class="text-h6 font-weight-bold mb-4">Channel mix</div>
        <div class="chart-shell">
          <Doughnut :data="channelMix" :options="doughnutOptions" />
        </div>
      </v-card>
    </v-col>
  </v-row>

  <v-row class="mt-2" dense>
    <v-col cols="12" lg="8">
      <v-card class="pa-4" elevation="0" border>
        <div class="text-overline text-medium-emphasis">Products</div>
        <div class="text-h6 font-weight-bold mb-4">Top selling categories</div>
        <div class="chart-shell">
          <Bar :data="salesByCategory" :options="categoryOptions" />
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card class="pa-4" elevation="0" border>
        <div class="text-overline text-medium-emphasis">Operations</div>
        <div class="text-h6 font-weight-bold mb-4">Priority alerts</div>
        <v-list density="comfortable" nav>
          <v-list-item prepend-icon="mdi-alert-circle" title="Low stock: Classic train set" subtitle="Only 12 left" />
          <v-list-item prepend-icon="mdi-truck-fast" title="Shipment delay: West region" subtitle="4 orders pending" />
          <v-list-item prepend-icon="mdi-currency-usd" title="Promo campaign hitting target" subtitle="ROAS 3.4x" />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

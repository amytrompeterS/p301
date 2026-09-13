<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import metrics from './data/metrics.json'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const monthOptions = ['All', ...metrics.monthly.map((item) => item.month)]
const selectedMonth = ref('All')

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const formatCompactCurrency = (value: number) => {
  const amount = value / 1000
  return `$${amount.toFixed(amount >= 100 ? 0 : 1)}K`
}

const formatCompactNumber = (value: number) => {
  if (value >= 100000) return `${(value / 1000).toFixed(1)}K`
  return new Intl.NumberFormat('en-US').format(value)
}

const asPercent = (value: number) => `${value.toFixed(1)}%`
const asMultiplier = (value: number) => `${value.toFixed(1)}x`

const monthIndex = computed(() => metrics.monthly.findIndex((item) => item.month === selectedMonth.value))

const priorMonth = computed(() => {
  if (selectedMonth.value === 'All') return metrics.monthly[metrics.monthly.length - 2]
  const index = metrics.monthly.findIndex((item) => item.month === selectedMonth.value)
  return metrics.monthly[Math.max(index - 1, 0)]
})

const currentMonth = computed(() => {
  if (selectedMonth.value === 'All') return metrics.monthly[metrics.monthly.length - 1]
  return metrics.monthly.find((item) => item.month === selectedMonth.value) ?? metrics.monthly[0]
})

const deltaPct = (current: number, previous: number) => ((current - previous) / previous) * 100

const summaryCards = computed(() => {
  const current = currentMonth.value
  const previousValue = priorMonth.value
  const revenueValue = selectedMonth.value === 'All' ? metrics.summary.revenue : current.revenue
  const trafficValue = selectedMonth.value === 'All' ? metrics.summary.footTraffic : current.footTraffic
  const promoValue = selectedMonth.value === 'All' ? metrics.summary.promoLift : current.promoLift
  const inventoryValue = selectedMonth.value === 'All' ? metrics.summary.inventoryTurn : current.inventoryTurn

  const revenueDelta = selectedMonth.value === 'All'
    ? deltaPct(metrics.monthly[11].revenue, metrics.monthly[10].revenue)
    : deltaPct(current.revenue, previousValue.revenue)

  const trafficDelta = selectedMonth.value === 'All'
    ? deltaPct(metrics.monthly[11].footTraffic, metrics.monthly[10].footTraffic)
    : deltaPct(current.footTraffic, previousValue.footTraffic)

  const promoDelta = selectedMonth.value === 'All'
    ? deltaPct(metrics.monthly[11].promoLift, metrics.monthly[10].promoLift)
    : deltaPct(current.promoLift, previousValue.promoLift)

  const inventoryDelta = selectedMonth.value === 'All'
    ? deltaPct(metrics.monthly[11].inventoryTurn, metrics.monthly[10].inventoryTurn)
    : deltaPct(current.inventoryTurn, previousValue.inventoryTurn)

  return [
    {
      label: 'Sales by SKU',
      value: selectedMonth.value === 'All' ? formatCompactCurrency(revenueValue) : formatCompactCurrency(revenueValue),
      change: `${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)}%`,
      icon: 'mdi-cash-multiple',
      color: 'primary',
      positive: revenueDelta >= 0,
      subtext: selectedMonth.value === 'All' ? 'Year-to-date sales' : `${current.month} vs. previous month`,
    },
    {
      label: 'Foot Traffic',
      value: selectedMonth.value === 'All' ? formatCompactNumber(trafficValue) : formatCompactNumber(trafficValue),
      change: `${trafficDelta >= 0 ? '+' : ''}${trafficDelta.toFixed(1)}%`,
      icon: 'mdi-account-group',
      color: 'success',
      positive: trafficDelta >= 0,
      subtext: selectedMonth.value === 'All' ? 'Annual store visits' : `${current.month} vs. previous month`,
    },
    {
      label: 'Promo Lift',
      value: selectedMonth.value === 'All' ? asPercent(promoValue) : asPercent(promoValue),
      change: `${promoDelta >= 0 ? '+' : ''}${promoDelta.toFixed(1)}%`,
      icon: 'mdi-tag-percent',
      color: 'warning',
      positive: promoDelta >= 0,
      subtext: selectedMonth.value === 'All' ? 'Average campaign lift' : `${current.month} vs. previous month`,
    },
    {
      label: 'Inventory Turn',
      value: selectedMonth.value === 'All' ? asMultiplier(inventoryValue) : asMultiplier(inventoryValue),
      change: `${inventoryDelta >= 0 ? '+' : ''}${inventoryDelta.toFixed(1)}%`,
      icon: 'mdi-package-variant',
      color: 'info',
      positive: inventoryDelta >= 0,
      subtext: selectedMonth.value === 'All' ? 'Average annual rotation' : `${current.month} vs. previous month`,
    },
  ]
})

const chartData = computed(() => ({
  labels: metrics.monthly.map((item) => item.month),
  datasets: [
    {
      label: 'Revenue',
      data: metrics.monthly.map((item) => item.revenue),
      fill: true,
      borderColor: '#A5B4FC',
      backgroundColor: 'rgba(165, 180, 252, 0.28)',
      borderWidth: 3,
      pointRadius: metrics.monthly.map((_, index) => (selectedMonth.value === 'All' ? 4 : index === monthIndex.value ? 6 : 3)),
      pointHoverRadius: 6,
      pointBackgroundColor: metrics.monthly.map((_, index) =>
        selectedMonth.value === 'All' ? '#A5B4FC' : index === monthIndex.value ? '#7C3AED' : '#BFDBFE',
      ),
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      tension: 0.38,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0
          return `Revenue: ${formatCurrency(value)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748B',
      },
    },
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(148, 163, 184, 0.18)',
      },
      ticks: {
        callback: (value) => `$${Number(value) / 1000}K`,
        color: '#64748B',
      },
    },
  },
}))

const selectedSummary = computed(() => {
  if (selectedMonth.value === 'All') {
    return {
      title: 'Yearly performance',
      value: formatCompactCurrency(metrics.summary.revenue),
      note: 'All 12 months included',
    }
  }

  const current = currentMonth.value
  return {
    title: `${current.month} performance`,
    value: formatCompactCurrency(current.revenue),
    note: `Foot traffic: ${formatCompactNumber(current.footTraffic)}`,
  }
})
</script>

<template>
  <v-app>
    <v-app-bar color="surface" flat class="border-b-sm border-opacity-10">
      <v-container class="d-flex align-center" fluid>
        <div>
          <div class="text-overline text-medium-emphasis mb-1">Chicago Retail Ops</div>
          <div class="text-h5 font-weight-bold">Toy Store Operations Dashboard</div>
        </div>
        <v-spacer />
        <v-select
          v-model="selectedMonth"
          :items="monthOptions"
          variant="outlined"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-calendar-range"
          class="month-picker"
          width="170"
          label="Month"
        />
      </v-container>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <v-container class="py-8" fluid>
        <v-row class="mb-6" dense>
          <v-col v-for="card in summaryCards" :key="card.label" cols="12" sm="6" md="3">
            <v-card class="h-100 rounded-xl pa-4" flat border>
              <div class="d-flex align-center justify-space-between mb-4">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">{{ card.label }}</div>
                  <div class="text-h4 font-weight-bold">{{ card.value }}</div>
                </div>
                <v-avatar :color="card.color" size="42">
                  <v-icon color="white" :icon="card.icon" />
                </v-avatar>
              </div>

              <div class="d-flex align-center justify-space-between">
                <div>
                  <span class="text-body-2" :class="card.positive ? 'text-success' : 'text-error'">
                    <v-icon size="16" :icon="card.positive ? 'mdi-arrow-up' : 'mdi-arrow-down'" />
                    {{ card.change }}
                  </span>
                </div>
                <div class="text-caption text-medium-emphasis">{{ card.subtext }}</div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="rounded-xl mb-6" flat border>
          <div class="d-flex align-center justify-space-between pa-5 pb-0">
            <div>
              <div class="text-overline text-medium-emphasis">Revenue trend</div>
              <div class="text-h6 font-weight-bold">{{ selectedSummary.title }}</div>
            </div>
            <div class="text-body-2 text-medium-emphasis">{{ selectedSummary.note }}</div>
          </div>

          <div class="pa-5 pt-2">
            <div class="chart-shell">
              <Line :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.month-picker {
  max-width: 180px;
}

.chart-shell {
  height: 320px;
}
</style>

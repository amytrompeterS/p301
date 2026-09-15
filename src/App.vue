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
const skuView = ref<'top' | 'lowest'>('top')

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
const annualRevenueTotal = metrics.monthly.reduce((total, item) => total + item.revenue, 0)

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
      label: 'Sales',
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
      icon: 'mdi-sale',
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

const rankedSkus = computed(() => {
  const selectedRevenueFactor = selectedMonth.value === 'All'
    ? 1
    : (currentMonth.value.revenue / annualRevenueTotal) * metrics.monthly.length
  const previousRevenueFactor = selectedMonth.value === 'All'
    ? 1
    : (priorMonth.value.revenue / annualRevenueTotal) * metrics.monthly.length
  const monthTrend = selectedMonth.value === 'All'
    ? 0
    : ((selectedRevenueFactor - previousRevenueFactor) / previousRevenueFactor) * 100

  const sorted = metrics.salesBySku
    .map((sku) => ({
      ...sku,
      displayRevenue: sku.revenue * selectedRevenueFactor,
      displayTrend: sku.trend + monthTrend,
    }))
    .sort((a, b) => b.displayRevenue - a.displayRevenue)
  return skuView.value === 'top' ? sorted.slice(0, 10) : sorted.reverse().slice(0, 10)
})

const chartMonths = computed(() => {
  if (selectedMonth.value === 'All') return metrics.monthly

  const start = Math.max(monthIndex.value - 1, 0)
  const end = Math.min(monthIndex.value + 2, metrics.monthly.length)
  return metrics.monthly.slice(start, end)
})

const chartData = computed(() => ({
  labels: chartMonths.value.map((item) => item.month),
  datasets: [
    {
      label: 'Revenue',
      data: chartMonths.value.map((item) => item.revenue),
      fill: true,
      borderColor: '#A5B4FC',
      backgroundColor: 'rgba(165, 180, 252, 0.28)',
      borderWidth: 3,
      pointRadius: chartMonths.value.map((item) => (selectedMonth.value === 'All' || item.month !== selectedMonth.value ? 4 : 8)),
      pointHoverRadius: 6,
      pointBackgroundColor: chartMonths.value.map((item) =>
        selectedMonth.value === 'All' ? '#A5B4FC' : item.month === selectedMonth.value ? '#7C3AED' : '#BFDBFE',
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
      min: selectedMonth.value === 'All'
        ? undefined
        : Math.floor((Math.min(...chartMonths.value.map((item) => item.revenue)) - 8000) / 1000) * 1000,
      max: selectedMonth.value === 'All'
        ? undefined
        : Math.ceil((Math.max(...chartMonths.value.map((item) => item.revenue)) + 8000) / 1000) * 1000,
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
    title: `${current.month} detail view`,
    value: formatCompactCurrency(current.revenue),
    note: `Focused against ${chartMonths.value.length - 1} nearby month${chartMonths.value.length - 1 === 1 ? '' : 's'}`,
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

    <v-main class="dashboard-main">
      <v-container class="py-8" fluid>
        <v-row class="mb-6" dense>
          <v-col v-for="card in summaryCards" :key="card.label" cols="12" sm="6" md="3">
            <v-card class="h-100 rounded-xl pa-4" flat border>
              <div class="d-flex align-center justify-space-between mb-4">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">{{ card.label }}</div>
                  <div class="text-h4 font-weight-bold">{{ card.value }}</div>
                </div>
                <v-avatar :color="card.color" size="42" class="card-icon">
                  <v-icon color="white" :icon="card.icon" size="22" />
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

        <v-row dense class="dashboard-panels">
          <v-col cols="12" lg="6" class="panel-col">
            <v-card class="rounded-xl sku-card" flat border>
              <div class="d-flex align-center justify-space-between pa-5 pb-2">
                <div>
                  <div class="text-overline text-medium-emphasis">Sales by SKU</div>
                  <div class="text-h6 font-weight-bold">
                    {{ skuView === 'top' ? 'Top 10 toys' : 'Lowest 10 toys' }}
                    <span v-if="selectedMonth !== 'All'" class="text-body-2 text-medium-emphasis">· {{ selectedMonth }}</span>
                  </div>
                </div>
                <v-btn-toggle v-model="skuView" mandatory density="compact" color="primary" divided>
                  <v-btn value="top" size="small">Top</v-btn>
                  <v-btn value="lowest" size="small">Lowest</v-btn>
                </v-btn-toggle>
              </div>

              <v-list class="sku-list px-2 pb-3" lines="one">
                <template v-for="(sku, index) in rankedSkus" :key="sku.sku">
                  <v-list-item class="sku-row px-3">
                  <template #prepend>
                    <v-avatar size="28" color="grey-lighten-4" class="mr-3">
                      <span class="text-caption font-weight-bold text-medium-emphasis">{{ index + 1 }}</span>
                    </v-avatar>
                  </template>
                  <div class="sku-info">
                    <div class="text-body-2 font-weight-medium text-truncate">{{ sku.sku }}</div>
                    <div class="text-caption text-medium-emphasis">SKU-{{ sku.sku.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase() }}</div>
                  </div>
                  <template #append>
                    <div class="sku-meta">
                      <div class="sku-sales text-body-2 font-weight-medium">{{ formatCurrency(sku.displayRevenue) }}</div>
                      <div class="sku-trend" :class="sku.displayTrend >= 0 ? 'text-success' : 'text-error'">
                        <v-icon size="16" :icon="sku.displayTrend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'" />
                        {{ sku.displayTrend >= 0 ? '+' : '' }}{{ sku.displayTrend.toFixed(1) }}%
                      </div>
                    </div>
                  </template>
                  </v-list-item>
                  <v-divider v-if="index < rankedSkus.length - 1" class="sku-divider" />
                </template>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" lg="6" class="panel-col">
            <v-card class="rounded-xl chart-card" flat border>
              <div class="d-flex align-center justify-space-between pa-5 pb-0">
                <div>
                  <div class="text-overline text-medium-emphasis">Revenue trend</div>
                  <div class="text-h6 font-weight-bold">{{ selectedSummary.title }}</div>
                </div>
                <div class="text-body-2 text-medium-emphasis text-right">{{ selectedSummary.note }}</div>
              </div>

              <div class="pa-5 pt-2 chart-body">
                <div class="chart-shell">
                  <Line :data="chartData" :options="chartOptions" />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-picker {
  max-width: 180px;
}

.chart-shell {
  width: 100%;
  height: 100%;
  position: relative;
}

.dashboard-panels {
  align-items: stretch;
}

.panel-col {
  display: flex;
}

.sku-card {
  width: 100%;
}

.chart-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100%;
  height: 100%;
}

.chart-body {
  display: flex;
  height: 100%;
  min-height: 0;
}

.chart-shell :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.sku-row {
  align-items: center;
  min-height: 58px;
}

.sku-list :deep(.v-list-item__content) {
  min-width: 0;
}

.sku-info {
  min-width: 0;
}

.sku-meta {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 164px;
  justify-content: flex-end;
}

.sku-sales {
  min-width: 80px;
  text-align: right;
}

.sku-trend {
  min-width: 60px;
  text-align: right;
}

.sku-divider {
  margin: 0 12px;
  border-color: rgba(100, 116, 139, 0.55);
}

@media (max-width: 600px) {
  .chart-shell {
    min-height: 320px;
  }

  .sku-meta {
    gap: 8px;
    min-width: 136px;
  }

  .sku-sales {
    min-width: 68px;
    font-size: 0.75rem;
  }

  .sku-trend {
    min-width: 56px;
    font-size: 0.75rem;
  }
}
</style>

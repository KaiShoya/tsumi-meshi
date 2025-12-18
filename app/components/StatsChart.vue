<template>
  <div class="stats-chart">
    <canvas
      ref="canvasRef"
      :aria-label="ariaLabel"
      role="img"
    />

    <div
      v-if="!chartSupported"
      class="chart-fallback"
    >
      <p>
        {{ $t('statsChart.fallbackMessage') }}
      </p>

      <table>
        <thead>
          <tr>
            <th>{{ $t('statsChart.dateHeader') }}</th>
            <th>{{ $t('statsChart.countHeader') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.date"
          >
            <td>{{ row.date }}</td>
            <td>{{ row.count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @stylistic/member-delimiter-style */
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Row { date: string, count: number }

const props = defineProps<{
  rows: Row[]
  ariaLabel?: string
  chartType?: 'line' | 'bar'
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
type ChartInstance = {
  data: { labels?: string[]; datasets?: Array<{ data: number[] }> };
  update: () => void;
  destroy: () => void;
}
let chart: ChartInstance | null = null
const chartSupported = ref(true)

const { t } = useI18n()
const ariaLabel = computed(() => props.ariaLabel || t('statsChart.ariaLabel'))

onMounted(async () => {
  // dynamic import to keep dependency optional for PoC
  try {
    const m = (await import('chart.js')) as unknown as { Chart: unknown; registerables: unknown[] }
    const Chart = m.Chart as unknown
    const registerables = m.registerables || []

    // registerables is provided by Chart.js; call register if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(Chart as any).register?.(...(registerables as any[]))
    } catch {
      // ignore registration errors for PoC
    }

    if (!canvasRef.value) {
      chartSupported.value = false
      return
    }

    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) {
      chartSupported.value = false
      return
    }
    const labels = props.rows.map(r => r.date)
    const data = props.rows.map(r => r.count)

    // construct Chart instance via constructor typing
    const ChartCtor = (Chart as unknown) as new (ctx: CanvasRenderingContext2D, cfg: unknown) => ChartInstance
    chart = new ChartCtor(ctx, {
      type: props.chartType || 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'チェック数',
            data,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.08)',
            fill: true,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: true },
          y: { display: true }
        }
      }
    })
  } catch (err) {
    console.error('Chart.js not available', err)
    chartSupported.value = false
  }
})

watch(
  () => props.rows,
  (n) => {
    if (chart && n) {
      const labels = n.map(r => r.date)
      const counts = n.map(r => r.count)
      // Chart instance typing is loose for PoC; access via any to satisfy TS
      const c = chart as unknown as { data?: { labels?: string[]; datasets?: Array<{ data: number[] }> }; update?: () => void }
      if (c.data) {
        c.data.labels = labels
        if (c.data.datasets && c.data.datasets[0]) {
          c.data.datasets[0].data = counts
        }
      }
      chart.update()
    }
  }
)

onBeforeUnmount(() => {
  try {
    chart?.destroy()
  } catch {
    // ignore
  }
})
</script>

<style scoped>
.stats-chart { position: relative; min-height: 220px }
.stats-chart canvas { width: 100%; height: 100% }
.chart-fallback { margin-top: 8px }
table { width: 100%; border-collapse: collapse }
th, td { padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: left }
</style>

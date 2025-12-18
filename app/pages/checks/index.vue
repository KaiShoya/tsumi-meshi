<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        チェック統計
      </h1>
      <div class="flex items-center gap-2">
        <USelectMenu
          v-model="period"
          :options="[{ label: '月別', value: 'month' }, { label: '週別', value: 'week' }]"
          @update:model-value="loadStats"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard>
        <h3 class="text-sm text-gray-500">
          合計チェック数
        </h3>
        <div class="text-3xl font-bold mt-2">
          {{ stats.totalChecks }}
        </div>
      </UCard>

      <UCard>
        <h3 class="text-sm text-gray-500">
          選択期間のチェック数
        </h3>
        <div class="text-3xl font-bold mt-2">
          {{ stats.periodChecks }}
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SelectMenuItem } from '@nuxt/ui'
import { useChecksPageStore } from '~/stores/pages/checks'

definePageMeta({ requiresAuth: true })

const period = ref<'month' | 'week'>('month')
const stats = ref({ totalChecks: 0, periodChecks: 0 })

const checksPage = useChecksPageStore()

const loadStats = async (pIn?: SelectMenuItem) => {
  const p = (pIn as unknown as 'month' | 'week') ?? period.value
  period.value = p
  const res = await checksPage.fetchStats(p)
  stats.value = res
}

onMounted(async () => {
  await loadStats()
})
</script>

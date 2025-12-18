import { defineStore } from 'pinia'
import type { StatsResponse } from '~/repositories/stats'
import { apiClient } from '~/utils/api/client'
import { useAppToast } from '~/composables/useAppToast'
import { useLogger } from '~/composables/useLogger'

export const useDashboardPageStore = defineStore('dashboardPage', () => {
  const { showDangerToast } = useAppToast()
  const logger = useLogger()

  let data: StatsResponse | null = null
  let loading = false
  let range: '30d' | '90d' | '365d' = '30d'

  const setRange = (r: typeof range) => {
    range = r
  }

  const fetchDashboard = async (r?: typeof range) => {
    loading = true
    try {
      const res = await apiClient.getDashboardStats(r ?? range)
      data = res
      return res
    } catch (error) {
      showDangerToast('ダッシュボードの取得に失敗しました')
      logger.error('Failed to fetch dashboard stats', { module: 'dashboardPage', range: r ?? range }, error instanceof Error ? error : undefined)
      return null
    } finally {
      loading = false
    }
  }

  return {
    data,
    loading,
    range,
    setRange,
    fetchDashboard
  }
})

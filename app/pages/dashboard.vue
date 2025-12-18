<template>
  <div class="page-dashboard">
    <h1>ダッシュボード</h1>

    <div
      v-if="error"
      class="error"
    >
      データ取得エラー: {{ error.message || String(error) }}
    </div>

    <div v-if="!data">
      <p>
        読み込み中…
      </p>
    </div>

    <div v-else>
      <div class="cards">
        <div class="card">
          <h3>総レシピ数</h3>
          <p class="num">
            {{ data.summary.totalRecipes }}
          </p>
        </div>
        <div class="card">
          <h3>総チェック数</h3>
          <p class="num">
            {{ data.summary.totalChecks }}
          </p>
        </div>
        <div class="card">
          <h3>アクティブタグ数</h3>
          <p class="num">
            {{ data.summary.activeTags }}
          </p>
        </div>
      </div>

      <div class="layout">
        <section class="left">
          <h2>日別チェック数（30日）</h2>
          <div class="chart-wrap">
            <StatsChart
              :rows="data.checksOverTime"
              aria-label="日別チェック数"
            />
          </div>
        </section>

        <aside class="right">
          <h2>上位タグ</h2>
          <ul>
            <li
              v-for="t in data.topTags"
              :key="t.tag"
            >
              {{ t.tag }} — {{ t.count }}
            </li>
          </ul>
        </aside>
      </div>

      <section class="recent">
        <h2>最近のレシピ</h2>
        <ul>
          <li
            v-for="r in data.recentRecipes"
            :key="r.id"
          >
            {{ r.title }} — {{ r.createdAt }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatsChart from '~/components/StatsChart.vue'
import { apiClient } from '~/utils/api/client'

definePageMeta({ requiresAuth: true })

defineOptions({ name: 'DashboardPage' })

const { data, error } = await useAsyncData('dashboard-stats', async () => {
  return apiClient.getDashboardStats('30d')
})
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin: 12px 0;
}
.card {
  background: #fff;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card .num { font-size: 1.5rem; margin-top: 8px; font-weight: 600 }
.layout { display: flex; gap: 16px; margin-top: 18px; align-items: flex-start }
.left { flex: 2 }
.right {
  flex: 1;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  max-height: 480px;
  overflow: auto;
}
.chart-wrap {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  min-height: 260px;
  height: 100%;
}
.recent { margin-top: 18px; background: #fff; padding: 12px; border-radius: 8px }

/* Small screens: stack layout and reduce paddings */
@media (max-width: 800px) {
  .layout { flex-direction: column }
  .card { padding: 10px }
  .chart-wrap { min-height: 200px }
  .right { max-height: none }
}

/* Improve readability on very large screens */
@media (min-width: 1600px) {
  .cards { gap: 18px }
  .card .num { font-size: 1.8rem }
}
</style>

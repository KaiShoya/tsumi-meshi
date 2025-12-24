export default defineEventHandler(async () => {
  // PoC: return sample aggregated stats for the current user.
  // In production, replace with real DB queries and enforce auth.

  const now = new Date()
  // build checksOverTime for last 30 days
  const checksOverTime: Array<{ date: string, count: number }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    checksOverTime.push({ date, count: Math.floor(Math.random() * 5) })
  }

  const topTags = [
    { tag: '和食', count: 45 },
    { tag: '時短', count: 30 },
    { tag: 'お弁当', count: 18 }
  ]

  const recentRecipes = Array.from({ length: 8 }).map((_, i) => ({
    id: `r_poc_${i}`,
    title: `サンプルレシピ ${i + 1}`,
    createdAt: new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10)
  }))

  return {
    summary: {
      totalRecipes: 123,
      totalChecks: checksOverTime.reduce((s, r) => s + r.count, 0),
      activeTags: topTags.length
    },
    checksOverTime,
    topTags,
    recentRecipes
  }
})

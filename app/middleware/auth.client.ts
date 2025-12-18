export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // Ensure auth state is initialized on the client
  await auth.initAuth()

  // Allow auth routes
  if (to.path.startsWith('/auth')) {
    // If already authenticated and visiting auth page, redirect to target or home
    if (auth.isAuthenticated.value) {
      const redirectTo = (to.query.redirectTo as string) || '/'
      return navigateTo(redirectTo)
    }
    return
  }

  // For all other routes, require authentication
  if (!auth.isAuthenticated.value) {
    const redirect = `/auth/login?redirectTo=${encodeURIComponent(to.fullPath)}`
    return navigateTo(redirect)
  }
})

<template>
  <div>
    <!-- Navigation -->
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center space-x-2"
        >
          <UIcon
            name="i-lucide-book-open"
            class="h-6 w-6"
          />
          <span class="font-bold text-lg">{{ t('app.title') }}</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center space-x-4">
          <LanguageSwitcher />
          <span class="text-sm text-gray-600">{{ user?.name }}</span>
          <UButton
            icon="i-lucide-log-out"
            variant="ghost"
            size="sm"
            @click="logout"
          >
            {{ t('auth.logout') }}
          </UButton>
        </div>
      </template>
    </UHeader>

    <!-- Main Content -->
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </div>
</template>

<script setup lang="ts">
const { user, logout, isAuthenticated } = useAuth()
const { t } = useI18n()

// Redirect to login if not authenticated
if (!isAuthenticated.value) {
  await navigateTo('/auth/login')
}
</script>

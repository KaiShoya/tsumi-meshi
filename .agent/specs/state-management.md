# State Management

## Overview
Pinia-based state management with 3-tier architecture: Global, Data, and Presentation layers.

## Store Structure

### Data Stores (`store/data/`)
Pure data fetching and state management. No business logic or user notifications.

#### recipesStore
```typescript
interface RecipesState {
  recipes: Recipe[]
  loading: boolean
}

const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)

  const fetchRecipes = async () => {
    loading.value = true
    try {
      // Support optional filters/search: fetchRecipes may accept `{ q?, folderId?, tagIds? }`
      recipes.value = await $recipesRepository.fetchAll(getCurrentUserId())
    } catch (error) {
      throw error // Simply rethrow
    } finally {
      loading.value = false
    }
  }

  const createRecipe = async (recipe: RecipeInput) => {
    const newRecipe = await $recipesRepository.create(recipe, getCurrentUserId())
    recipes.value.push(newRecipe)
  }

  // Other CRUD methods...

  return {
    recipes: readonly(recipes),
    loading: readonly(loading),
    fetchRecipes,
    createRecipe,
    // ...
  }
})
```

#### foldersStore
Similar structure for folder operations.

#### tagsStore
Similar structure for tag operations.

### Page Stores (`store/pages/`)
Business logic, error handling, and user notifications.

#### recipesPageStore
```typescript
const useRecipesPageStore = defineStore('recipesPage', () => {
  const recipesStore = useRecipesStore()
  const { showSuccessToast, showDangerToast } = useAppToast()
  const { $logger } = useNuxtApp()

  const createRecipe = async (recipe: RecipeInput) => {
    try {
      showLoading()
      await recipesStore.createRecipe(recipe)
      showSuccessToast('Recipe created successfully')
      await fetchRecipes() // Refresh list
    } catch (error) {
      if (error instanceof CustomError) {
        showDangerToast(error.getMessage())
      }
      $logger.error('Failed to create recipe', { module: 'recipesPageStore' }, error)
    } finally {
      hideLoading()
    }
  }

  // Other methods with error handling...

#### checksStore
`checksStore` provides history for a specific recipe and exposes:

- `fetchChecks(recipeId: number)` — fetches `RecipeCheck[]` for a recipe

Page stores should call into `checksStore` and expose `fetchStats(period)` via API client wrappers (page store handles errors and toasts).
})
```

## Store Usage Guidelines

### Data Stores
- ✅ Call repositories directly
- ✅ Expose state as `readonly()`
- ✅ Throw errors as-is (no toast)
- ❌ No user notifications
- ❌ No business logic aggregation

### Page Stores
- ✅ Combine multiple data stores
- ✅ Handle errors and show toasts
- ✅ Implement loading states
- ✅ Log errors
- ❌ No direct repository calls
- ❌ No rethrow without handling

## Global State
- **Auth Store**: User authentication state
- **UI Store**: Global UI state (loading, modals)
- **Toast Store**: Notification management

## State Persistence
- User preferences: Local storage
- Authentication: Secure storage
- App state: Not persisted (refresh resets)

## Performance
- Use `storeToRefs()` for reactive destructuring
- Avoid deep watching large objects
- Implement proper cleanup in components

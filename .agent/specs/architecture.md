# Architecture

## Overview
Tsumi Meshi follows Clean Architecture principles with Nuxt 4, TypeScript, Pinia, and Cloudflare D1/KV.

## Technology Stack
- **Frontend**: Nuxt 4, TypeScript, Vue 3, Pinia
- **UI**: NuxtUI (Tailwind CSS + Radix UI)
- **Database**: Cloudflare D1 (SQLite)
- **API**: Cloudflare Workers (REST API)
- **Deployment**: Cloudflare Pages + Workers
- **Authentication**: Cloudflare Workers (JWT-based)
- **Testing**: Vitest, @nuxt/test-utils

## Layer Architecture

### Presentation Layer
- **Components** (`app/components/`): Vue components using NuxtUI
- **Pages** (`app/pages/`): Route-based page components
- **Composables** (`app/composables/`): Reusable Vue logic

### Application Layer
- **Page Stores** (`store/pages/`): Business logic, error handling, user notifications
- **Data Stores** (`store/data/`): Data fetching, state management

### Domain Layer
-- **Server-side data access / Repositories** (`workers/`): Data access abstraction implemented for Cloudflare Workers (server-side)
- **Models**: TypeScript interfaces for data structures

Note: For frontend code, network interactions should go through the API client located at `app/utils/api/client.ts` (or `apiClient`). Do not import server-side repository implementations from browser code — those files are intended for server-side use inside `workers/`.

### Infrastructure Layer
- **API**: Cloudflare Workers for REST endpoints
- **Database**: Cloudflare D1 for data persistence

## Directory Structure
```
app/
├── components/          # Vue components
├── composables/         # Vue composables
├── pages/              # Page components
├── repositories/       # Data access layer
├── stores/             # Pinia stores
│   ├── data/           # Data stores
│   └── pages/          # Page stores
├── utils/              # Utilities
│   ├── api/            # API clients
│   └── locales/        # i18n files
├── assets/             # Static assets


.agent/
├── specs/              # Specifications
└── docs/               # Documentation
```

## Design Patterns
- **Repository Pattern**: Data access abstraction
- **Store Pattern**: State management with Pinia
- **Composition API**: Vue 3 reactive patterns
- **Dependency Injection**: Service injection where needed

## Authentication
- **Method**: Cloudflare Workers + JWT
- **Why**: Cloudflare ecosystem integration, secure token-based auth
- **Features**: User registration, login, token refresh
- **Security**: JWT with expiration, user data isolation

## Image Management
- **Storage**: Cloudflare R2
- **Directory Structure**: `users/{userId}/recipes/{recipeId}/{filename}`
- **Naming**: `{timestamp}-{originalName}` to avoid conflicts
- **Access**: Private with signed URLs for secure access
- **Optimization**: Resize/compress on upload for performance

## Performance
- Lazy loading for components
- Database query optimization
- Caching strategies for frequently accessed data
- Mobile-first responsive design

## Internationalization
- Vue i18n integration
- Locale files in `app/utils/locales/`
- Support for Japanese and English

## Error Handling
- Custom error classes with error codes
- Integration ready for NewRelic monitoring
- User-friendly messages vs developer logs
- Toast notifications for user feedback

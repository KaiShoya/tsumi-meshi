# Features

## Overview
Tsumi Meshi is a web application for managing recipes collected from YouTube and recipe sites. Users can organize recipes with folders, tags, and track completion status.

## User Management
- Multi-user support with user-specific data isolation
- Authentication required for all features
- User registration and login

## Core Features

### Recipe Management
- **Add Recipe**: Manual entry with title, URL, description
- **Edit Recipe**: Update recipe details
- **Delete Recipe**: Remove recipe with confirmation
- **View Recipe**: Display recipe details with source link

### Organization
- **Folders**: User-created hierarchical folders
  - Create, rename, delete folders
  - Nested folder support (up to 3 levels)
  - Move recipes between folders
- **Tags**: Pre-defined tags with ability to create new ones
  - Assign multiple tags to recipes
  - Filter recipes by tags

### Tracking
- **Check Status**: Mark recipes as "made"
  - Record check date
  - View check history
- **Statistics**: Monthly/weekly recipe completion stats
  - Charts and summaries

### Search & Filter
- Search by title, description, URL
- Filter by folder, tags, check status
- Sort by creation date, title

## UI/UX
- **Main Screen**: Recipe list with search/filter controls
- **Mobile Responsive**: Optimized for mobile devices
- **Navigation**: Sidebar for folders/tags, top bar for actions

## Chrome Extension Integration
- API endpoints for data synchronization
- Secure token-based authentication
- CRUD operations via REST API

## Additional Features
- **Multi-language Support**: Japanese/English (prepared for expansion)
- **Performance**: Optimized queries, caching where appropriate
- **Error Handling**: User-friendly error messages
- **Loading States**: Progress indicators for async operations
 - **Accessibility (a11y)**: Accessibility tests (axe-core) are part of the QA workflow; UI changes should include automated a11y checks and visible/sr-only labeling for form controls.
 - **E2E Smoke Tests**: Critical flows (create recipe, add tag, check recipe) have E2E smoke tests and are run on release branches or scheduled CI jobs.

## Future Features
- Bulk operations
- Recipe import/export
- Social sharing
- Advanced analytics

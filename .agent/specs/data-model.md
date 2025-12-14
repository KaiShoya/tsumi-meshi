# Data Model

## Overview
This document defines the data model for the Tsumi Meshi application using Cloudflare D1 (SQLite) database.

## Tables

### users
User authentication and profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user ID |
| email | TEXT | UNIQUE NOT NULL | User email address |
| name | TEXT | NOT NULL | Display name |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update date |

### folders
Hierarchical folder structure for organizing recipes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique folder ID |
| user_id | INTEGER | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Owner user ID |
| name | TEXT | NOT NULL | Folder name |
| parent_id | INTEGER | REFERENCES folders(id) ON DELETE CASCADE | Parent folder ID (NULL for root) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update date |

### tags
User-defined tags for categorizing recipes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique tag ID |
| user_id | INTEGER | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Owner user ID |
| name | TEXT | NOT NULL | Tag name |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation date |

### recipes
Main recipe storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique recipe ID |
| user_id | INTEGER | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Owner user ID |
| folder_id | INTEGER | REFERENCES folders(id) ON DELETE SET NULL | Folder ID |
| title | TEXT | NOT NULL | Recipe title |
| url | TEXT | NOT NULL | Source URL (YouTube/Recipe site) |
| description | TEXT |  | Recipe description/notes |
| image_url | TEXT |  | Thumbnail image URL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update date |

### recipe_tags
Many-to-many relationship between recipes and tags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| recipe_id | INTEGER | NOT NULL REFERENCES recipes(id) ON DELETE CASCADE | Recipe ID |
| tag_id | INTEGER | NOT NULL REFERENCES tags(id) ON DELETE CASCADE | Tag ID |
| PRIMARY KEY (recipe_id, tag_id) |  |  | Composite primary key |

### recipe_checks
Check history for recipes (when user marks as "made").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique check ID |
| recipe_id | INTEGER | NOT NULL REFERENCES recipes(id) ON DELETE CASCADE | Recipe ID |
| checked_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | When recipe was checked |

## Indexes
- users: email
- folders: user_id, parent_id
- tags: user_id, name
- recipes: user_id, folder_id, created_at
- recipe_tags: recipe_id, tag_id
- recipe_checks: recipe_id, checked_at

## Access Policies
All data is user-scoped. Queries must include user_id filtering to ensure data isolation.

## Migrations
Migrations will be managed through Cloudflare D1 migration files.

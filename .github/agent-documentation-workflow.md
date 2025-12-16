# 📋 Documentation & Task Management

## Directory Structure

This project uses `.agent/` directory for agent-driven documentation management:

```
.agent/
  ├── specs/                  # Source of truth for specifications
  ├── docs/
  │   ├── qa.md               # QA index (updated at release)
  │   ├── tasks.md            # Task list index (updated at release)
  │   ├── qa/                 # Version-based Q&A
  │   ├── tasks/              # Version-based task lists
  │   ├── qa-archive/         # Completed Q&A versions
  │   ├── task-archive/       # Completed task versions
  │   └── backlog-tasks.md    # Backlog and roadmap
  └── README.md               # Overview and quick start
```

**Important**: If `.agent/` directory doesn't exist in a project, create it automatically when needed.

## 📝 Documentation Guidelines

### Core Principles

- **Single Source of Truth**: Specifications in `.agent/specs/` must always be up-to-date when code changes
- **Separation of Concerns**: 
  - `.agent/specs/` — finalized specifications and architecture decisions
  - `.agent/docs/` — discussions, questions, task tracking, and roadmaps
- **Synchronized Updates**: Code changes and documentation updates must be in the same PR
- **Project-Specific Rules**: Language-specific and tool-specific details belong in `copilot-instructions.md`

### `.agent/docs/` - Working Documents

Use this directory for:

#### **qa.md** - Questions & Decisions Log
- Format: `## [Category] Question Title`
  - Categories: `[API]`, `[UI]`, `[Architecture]`, `[Testing]`, `[Database]`, etc.
- Recommended structure:
  ```markdown
  ## [Category] Question Title
  
  **Question**: Detailed question description
  
  **Answer**: Answer with rationale
  
  **Decided on**: YYYY-MM-DD
  **Related**: #issue_number (if applicable)
  ```
- Purpose: Document design decisions and architectural discussions for future reference

**QA File Division Rule**:

QA lists are divided by version to prevent merge conflicts. Same structure as tasks.md.

**Directory Structure**:
```
.agent/docs/
├── qa.md              ← Index (equivalent to tasks.md)
└── qa/
    ├── v1.20-qa.md          ← v1.20 Q&A and decisions during development
    ├── v1.21-qa.md          ← v1.21 Q&A (planned)
    ├── v1.22-qa.md          ← v1.22 Q&A (TBD)
    ├── qa-backlog.md        ← Long-term Q&A independent of version
    └── qa-archive/
        ├── v1.19-qa.md      (completed)
        └── ...
```

**During Development**:
1. New Q&A occurs → Record in corresponding `qa/vX.Y-qa.md`
2. Format: `## [Category] Issue #XXX: Question Title`
3. Linked with discussions in GitHub Issues comments
4. If spanning multiple versions → Record in v1.20 and reference from others

**At Release**:
1. Finalize the version's `qa/vX.Y-qa.md`
2. Move completed Q&A to `qa-archive/vX.Y-qa.md` (optional)
3. Update `qa-index.md`
4. Integrate decided Q&A into `.agent/specs/`

**GitHub Issues Sync Rules**:
1. When Q&A occurs during development → Add comment to GitHub Issue (or create new)
2. When task definitions/specs are updated → Add comment to related Issue
3. All Q&A discussions → Record in GitHub Issue
4. Final decisions → Record in QA file (link related Issue)

**Flow**:
```
Development question
    ↓
Add comment to GitHub Issue (question and context)
    ↓
User feedback / decision
    ↓
Record in Issue + add to QA file
    ↓
Update task list (link task number)
```

#### **tasks/ Directory** - Version-based Task Lists
- Format: `tasks/vX.Y-tasks.md` for each **minor version** (not patch version)
- Fields: `title`, `area`, `owner` (optional), `created` (YYYY-MM-DD), status (`- [ ]` / `- [x]`)
- When task completed, add: `completed`, `pr` (URL), `commit` (SHA)
- On release: Move completed version to `task-archive/`, update `tasks.md` (index)

#### **tasks.md** - Index of All Versions
- Updated only at release time
- Lists all active and archived version files
- Provides quick reference to which version is being worked on

#### **backlog-tasks.md** - Backlog & Roadmap
- Tasks with undecided target versions
- Roadmap for future releases (v1.21, v1.22, v2.0, etc.)
- Long-term considerations and issue statistics

#### **task-archive/** - Completed Versions
- Store finished version task files here
- Optional: Create `vX.Y-tasks-completed.md` with completed tasks summary

### `.agent/specs/` - Specifications (Source of Truth)

This directory contains finalized specifications that represent the **current state** of the system.

**Scope**: Architecture, API design, data models, business logic, and system-wide specifications.

**Not Included**: Component-level and screen-level specifications are managed in custom `<spec>` blocks within component files.

**Critical Rule**: When code changes, `.agent/specs/` MUST be updated accordingly.

#### Specifications Available

- **`architecture.md`**: System architecture, technology stack, and layer responsibilities
  - **Reference when**: Adding new features, creating new composables/stores/repositories
  - **Key info**: Directory structure, design patterns, timezone handling, i18n strategy

- **`data-model.md`**: Cloudflare D1/KV schema, table definitions, access policies, migrations
  - **Reference when**: Working with database operations, verifying type definitions, planning schema changes
  - **Key info**: Tables (recipes, etc.), foreign keys, indexes

- **`repository-api.md`**: Repository pattern implementation, CRUD APIs, error handling strategy
  - **Reference when**: Implementing `store/data/` stores, verifying data access methods
  - **Key info**: 4 repositories (Drinks, DrinkLabels, DrinkCounters, UserSettings), method specifications, error handling

- **`state-management.md`**: Pinia store design, global/data/presentation layer responsibilities
  - **Reference when**: Implementing stores, confirming state management strategy
  - **Key info**: Store layout (3-tier architecture), `storeToRefs()` usage, toast message timing

- **`features.md`**: User feature specifications, page structure, UI flows, cross-cutting features
  - **Reference when**: Adding new pages, confirming user flows, understanding feature requirements
  - **Key info**: 8 page specifications (login, home, drinks management, labels management, data analysis, settings), auth flow, error handling flow

## 🔄 Workflow

### During Chat Interactions

1. **Clarify requirements** through Q&A in the conversation
2. **Document decisions** in `.agent/docs/` at natural breakpoints
3. **Update specs** in `.agent/specs/` when decisions are finalized
4. **Link to GitHub Issues** for task tracking

### When Making Code Changes

**ALWAYS follow this sequence**:

1. ✅ Implement the code change
2. ✅ Update relevant `.agent/specs/` files
3. ✅ Mention the spec update in commit message
4. ✅ (For PRs) Include spec changes in the PR description

**Example commit message**:
```
feat: add drink filtering by date range

- Implement filter logic in DrinksRepository
- Update UI components
- Update .agent/specs/drinks-api.md with new endpoint
```

## 🏗️ Implementation Guidelines

### PR Review Checklist

When creating or reviewing PRs, verify:

- [ ] Code changes are implemented
- [ ] Tests are added/updated
- [ ] `.agent/specs/` is updated if specifications changed
- [ ] Related GitHub Issues are linked
- [ ] Documentation in `.agent/docs/` is updated if needed

## 🤖 Copilot Behavior

### Automatic Spec Update Prompts

When you detect code changes that affect specifications:

1. **Proactively suggest** spec updates
2. **Show a diff** of what needs to be updated
3. **Ask for confirmation** before updating

**Example prompt**:
```
コードを変更しました。以下の仕様ファイルも更新が必要です:

.agent/specs/drinks-api.md:
- [ ] Add new `filterByDateRange` parameter
- [ ] Update response schema

更新しますか?
```

### PR Creation Support

When code changes are ready for PR:

1. **Check** if `.agent/specs/` needs updates
2. **Generate** PR description including:
   - Summary of changes
   - Link to related specs
   - Checklist for reviewers
3. **Verify** GitHub Issue links

### Documentation Maintenance

- **Auto-detect** when discussions resolve open questions in `.agent/docs/`
- **Suggest** moving resolved items to `.agent/specs/`
- **Keep** QA list organized by categories

## 📌 Integration with GitHub Issues

- Tasks in `.agent/docs/` should reference GitHub Issues: `#123`
- Use GitHub Issue templates for consistency
- Update issue status when tasks are completed
- Link PRs to issues automatically: `Closes #123`

## 🎯 Best Practices

1. **Single Source of Truth**: `.agent/specs/` is always up-to-date
2. **Document Why, Not What**: Focus on rationale and context
3. **Keep Docs Lightweight**: Avoid duplicating information
4. **Link, Don't Copy**: Reference existing docs when possible
5. **Version Context**: Include dates and issue numbers for traceability

## 🚨 Common Mistakes to Avoid

- ❌ Updating code without updating specs
- ❌ Creating specs without real implementation
- ❌ Duplicating information across multiple files
- ❌ Forgetting to link GitHub Issues

---

## 🚀 Setup & Adoption Guide

For projects adopting this documentation workflow:

1. **Create directory structure**: Set up `.agent/specs/` and `.agent/docs/` directories
2. **Initialize specs**: Create initial specification files for your architecture and design
3. **Start task tracking**: Begin with `tasks.md` index and version-based task lists
4. **Establish PR policy**: Require documentation updates alongside code changes
5. **Respect project rules**: Reference `copilot-instructions.md` for language/framework-specific details

See [agent-operations.md](./agent-operations.md) for generic/reusable core rules applicable across projects.

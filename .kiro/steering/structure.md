# Project Structure - TKZ

## Root Directory Organization

```
tkz/
├── .kiro/                    # Kiro spec-driven development
│   ├── specs/                # Feature specifications
│   └── steering/             # Project steering documents (this file)
├── .claude/                  # Claude Code configuration
│   └── commands/             # Custom slash commands
├── .next/                    # Next.js build output (gitignored)
├── app/                      # Next.js App Router (pages & routes)
├── components/               # React components
├── lib/                      # Business logic, utilities, services
├── hooks/                    # Custom React hooks (top-level)
├── public/                   # Static assets
├── scripts/                  # Utility scripts
├── supabase/                 # Database migrations
├── e2e/                      # Playwright E2E tests
├── docs/                     # Project documentation
├── node_modules/             # Dependencies (gitignored)
├── .env.local                # Environment variables (gitignored)
├── .env.example              # Environment template
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.ts            # Next.js configuration
├── vitest.config.ts          # Vitest test configuration
├── playwright.config.ts      # Playwright E2E configuration
├── auth.ts                   # NextAuth.js configuration
├── auth.config.ts            # NextAuth.js config (edge-safe)
├── middleware.ts             # Next.js middleware (auth, redirects)
└── README.md                 # Project documentation
```

## Core Directories Deep Dive

### `/app` - Next.js App Router

File-system based routing with co-located components:

```
app/
├── (auth)/                   # Route group (not in URL)
│   └── login/
│       └── page.tsx          # /login
├── api/                      # API Routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts      # NextAuth.js endpoints
│   ├── health/
│   │   └── route.ts          # Health check endpoint
│   └── cron/
│       └── cleanup-deleted-tools/
│           └── route.ts      # Scheduled cleanup job
├── tools/                    # AI Tools feature
│   ├── page.tsx              # /tools (list)
│   ├── loading.tsx           # Loading UI
│   ├── new/
│   │   └── page.tsx          # /tools/new (create)
│   └── [id]/                 # Dynamic route
│       ├── page.tsx          # /tools/[id] (detail)
│       ├── loading.tsx       # Loading UI
│       └── edit/
│           └── page.tsx      # /tools/[id]/edit
├── prompt/                   # Sora prompt generation
│   ├── page.tsx              # /prompt (generator)
│   └── loading.tsx           # Loading UI
├── history/                  # Prompt history
│   ├── page.tsx              # /history (list)
│   ├── loading.tsx           # Loading UI
│   └── [id]/
│       └── page.tsx          # /history/[id] (detail)
├── layout.tsx                # Root layout (wraps all pages)
├── page.tsx                  # / (home/landing)
├── loading.tsx               # Global loading UI
├── providers.tsx             # Context providers wrapper
├── globals.css               # Global styles
└── __tests__/                # App-level tests
    └── sw.test.ts            # Service worker tests
```

**Routing Conventions:**
- `page.tsx` = Route endpoint
- `layout.tsx` = Shared UI wrapper
- `loading.tsx` = Streaming loading UI (Suspense)
- `error.tsx` = Error boundary (not yet implemented)
- `[param]/` = Dynamic route segment
- `(group)/` = Route group (organization, not in URL)

### `/components` - React Components

Feature-organized component library:

```
components/
├── ui/                       # Reusable UI primitives (shadcn/ui)
│   ├── button.tsx            # Button component (variants)
│   ├── input.tsx             # Input with validation styles
│   ├── textarea.tsx          # Textarea with auto-resize
│   ├── select.tsx            # Dropdown select
│   ├── card.tsx              # Card container
│   ├── dialog.tsx            # Modal dialog (Radix)
│   ├── alert-dialog.tsx      # Confirmation dialog
│   ├── form.tsx              # Form primitives (react-hook-form)
│   ├── label.tsx             # Form label
│   ├── checkbox.tsx          # Checkbox input
│   ├── tooltip.tsx           # Hover tooltip
│   ├── popover.tsx           # Popover container
│   ├── sheet.tsx             # Side sheet/drawer
│   ├── spinner.tsx           # Loading spinner
│   ├── skeleton.tsx          # Skeleton loading
│   ├── toaster.tsx           # Toast notifications
│   ├── date-picker.tsx       # Calendar date picker
│   ├── command-menu.tsx      # Cmd+K palette
│   ├── theme-toggle.tsx      # Dark/light mode toggle
│   ├── animated-button.tsx   # Button with animations
│   ├── animated-link.tsx     # Link with transitions
│   ├── page-transition.tsx   # Page transition wrapper
│   ├── form-feedback.tsx     # Form success/error messages
│   ├── form-overlay.tsx      # Form submission overlay
│   ├── success-checkmark.tsx # Success animation
│   ├── textarea-with-counter.tsx  # Textarea with char count
│   ├── loading-spinner.tsx   # Consistent spinner
│   ├── confirm-dialog.tsx    # Generic confirmation
│   └── __tests__/            # UI component tests
├── auth/                     # Authentication components
│   ├── login-form.tsx        # Login form with validation
│   ├── logout-button.tsx     # Logout with confirmation
│   ├── session-manager.tsx   # Session expiry handling
│   ├── session-expired-notification.tsx
│   ├── auth-error-message.tsx
│   └── __tests__/            # Auth component tests
├── tools/                    # AI Tools feature components
│   ├── tools-list.tsx        # Tool grid/list display
│   ├── tool-card.tsx         # Individual tool card
│   ├── tool-search-input.tsx # Search with debounce
│   ├── tool-form.tsx         # Shared form logic
│   ├── tool-create-form.tsx  # Creation form
│   ├── tool-edit-form.tsx    # Edit form
│   ├── tool-delete-button.tsx
│   ├── like-button.tsx       # Tool like functionality
│   └── __tests__/            # Tool component tests
├── prompt/                   # Prompt generation components
│   ├── prompt-generator.tsx  # Main generator UI
│   ├── prompt-form.tsx       # Input form
│   ├── prompt-result-dialog.tsx
│   ├── prompt-history-list.tsx
│   ├── prompt-history-card.tsx
│   ├── prompt-history-copy-button.tsx
│   ├── prompt-history-delete-button.tsx
│   └── __tests__/            # Prompt component tests
├── layout/                   # Layout components
│   ├── navbar.tsx            # Top navigation bar
│   ├── sidebar-navigation.tsx
│   ├── bottom-navigation.tsx # Mobile bottom nav
│   ├── authenticated-layout.tsx
│   └── __tests__/            # Layout tests
├── analytics/                # Analytics components
│   └── web-vitals.tsx        # Performance monitoring
└── error-boundary.tsx        # Global error boundary
```

**Component Conventions:**
- `ui/*` = Presentational, reusable across features
- Feature folders = Domain-specific, composed of `ui/*`
- `.tsx` = Client components (default)
- Server components when no interactivity needed
- Tests co-located in `__tests__/` directories

### `/lib` - Business Logic Layer

Layered architecture with clear separation:

```
lib/
├── actions/                  # Server Actions (Next.js)
│   ├── ai-tool.actions.ts    # Tool CRUD operations
│   ├── prompt.actions.ts     # Prompt generation & history
│   ├── like.actions.ts       # Like functionality
│   └── __tests__/            # Integration tests
├── services/                 # Business logic layer
│   ├── ai-tool.service.ts    # Tool business logic
│   ├── prompt-generation.service.ts
│   ├── prompt-history.service.ts
│   └── __tests__/            # Service integration tests
├── repositories/             # Data access layer
│   ├── ai-tool-repository.ts
│   ├── prompt-history-repository.ts
│   ├── user-repository.ts
│   └── __tests__/            # Repository tests
├── schemas/                  # Zod validation schemas
│   ├── ai-tool.schema.ts
│   ├── prompt.schema.ts
│   ├── like.schema.ts
│   ├── tag.schema.ts
│   └── __tests__/            # Schema tests
├── types/                    # TypeScript type definitions
│   ├── result.ts             # Result<T, E> type
│   └── __tests__/            # Type tests
├── clients/                  # External API clients
│   └── openai-client.ts      # OpenAI GPT-4 wrapper
├── supabase/                 # Supabase configuration
│   ├── client.ts             # Browser client
│   ├── server.ts             # Server-side client
│   └── types.ts              # Database types (generated)
├── auth/                     # Authentication utilities
│   ├── actions.ts            # Auth Server Actions
│   └── helpers.ts            # Auth helper functions
├── hooks/                    # Shared React hooks (lib-level)
│   ├── use-debounce.ts
│   ├── use-auto-save.ts
│   └── use-unsaved-changes.ts
├── providers/                # React Context providers
│   ├── theme-provider.tsx
│   ├── swr-provider.tsx
│   ├── animation-provider.tsx
│   └── __tests__/            # Provider tests
├── styles/                   # Style utilities & tests
│   └── __tests__/
├── utils/                    # General utilities
│   ├── logger.ts             # Structured logging
│   └── __tests__/
├── env.ts                    # Environment variable validation
├── utils.ts                  # General utilities (cn, etc.)
└── toast.ts                  # Toast notification wrapper
```

**Layering Pattern:**
```
Actions (Server Entry) → Services (Business Logic) → Repositories (Data Access) → Supabase
                      ↓
                   Schemas (Validation)
```

**Key Principles:**
- Actions = Server Actions, called from client
- Services = Pure business logic, reusable
- Repositories = Database queries only
- Schemas = Validation, shared by all layers

### `/hooks` - Custom React Hooks (Top-Level)

**Note:** There's duplication between `/hooks` and `/lib/hooks`. Consider consolidating.

```
hooks/
├── use-debounce.ts           # Debounce state changes
├── use-auto-save-form.ts     # Form auto-save logic
├── use-unsaved-changes.ts    # Warn on navigation
├── use-session-management.ts # Session expiry handling
└── __tests__/                # Hook tests
```

### `/supabase` - Database Migrations

Version-controlled database schema:

```
supabase/
└── migrations/
    ├── 20250120000001_initial_schema.sql
    ├── 20250120000002_seed_users.sql
    └── [timestamp]_[description].sql
```

**Migration Conventions:**
- Timestamp prefix: `YYYYMMDDHHMMSS`
- Descriptive name after timestamp
- Applied in chronological order
- Never edit existing migrations (create new ones)

### `/e2e` - End-to-End Tests

Playwright test suites:

```
e2e/
├── auth.setup.ts             # Authentication setup for tests
├── navigation.spec.ts        # Navigation flow tests
├── ai-tool-management.spec.ts
├── prompt-generation.spec.ts
├── history-management.spec.ts
├── responsive-ui.spec.ts
└── README.md                 # E2E testing guide
```

### `/docs` - Project Documentation

```
docs/
├── README.md                 # Documentation index
├── DEPLOYMENT.md             # Deployment guide (Vercel)
├── OPTIMIZATION.md           # Performance guide
├── GOOGLE_OAUTH_SETUP_PROGRESS.md
├── ACCESSIBILITY_TEST_CHECKLIST.md
├── E2E_TEST_GUIDE.md
└── [feature]_GUIDE.md        # Feature-specific docs
```

## Code Organization Patterns

### Naming Conventions

**Files:**
- `kebab-case.tsx` for components
- `kebab-case.ts` for utilities
- `PascalCase` for component names inside files
- `camelCase` for functions and variables

**Directories:**
- `kebab-case/` for feature directories
- `[param]/` for dynamic routes

### Import Organization

Standard import order:
```typescript
// 1. External dependencies
import { useState } from 'react'
import { useForm } from 'react-hook-form'

// 2. Internal absolute imports (@/...)
import { Button } from '@/components/ui/button'
import { aiToolSchema } from '@/lib/schemas/ai-tool.schema'

// 3. Relative imports
import { ToolCard } from './tool-card'

// 4. Types
import type { AITool } from '@/lib/supabase/types'

// 5. Styles (if any)
import './styles.css'
```

### File Structure Template

**React Component:**
```typescript
// 1. Imports
import { ... }

// 2. Types/Interfaces
interface ToolCardProps { ... }

// 3. Constants (if any)
const MAX_DESCRIPTION_LENGTH = 200

// 4. Helper functions (if small & local)
function formatDate(...) { ... }

// 5. Main component
export function ToolCard({ ... }: ToolCardProps) {
  // Hooks
  const [state, setState] = useState()

  // Event handlers
  const handleClick = () => { ... }

  // Render
  return <div>...</div>
}

// 6. Sub-components (if small & only used here)
function ToolCardHeader() { ... }
```

**Service/Utility:**
```typescript
// 1. Imports
import { ... }

// 2. Types
interface ServiceOptions { ... }

// 3. Constants
const DEFAULT_OPTIONS = { ... }

// 4. Main export
export class AIToolService {
  // Public methods
  async getTools() { ... }

  // Private methods
  private validate() { ... }
}

// OR for functional style:
export async function getTools(...) { ... }
```

## Key Architectural Principles

### 1. Server-First Architecture
- Default to Server Components
- Use Client Components (`'use client'`) only when needed:
  - Interactive state (useState, useEffect)
  - Browser APIs
  - Event handlers

### 2. Repository Pattern
- All database access through repositories
- Services never directly query database
- Repositories return `Result<T, Error>` types

### 3. Result Type Pattern
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }
```
- Explicit error handling
- No try-catch at call sites
- Type-safe error propagation

### 4. Validation-First
- All external data validated with Zod
- Schemas defined once, reused across layers
- Type inference from schemas

### 5. Feature-Based Organization
- Components organized by feature, not type
- Co-located tests
- Clear feature boundaries

### 6. Progressive Enhancement
- Core functionality works without JS
- Enhanced with client-side interactivity
- Graceful degradation

### 7. Type Safety
- Strict TypeScript mode
- Database types generated from Supabase
- No `any` types (use `unknown` if needed)

---

*Last Updated: 2025-10-23*
*Conventions: kebab-case files, PascalCase components, camelCase functions*
*Architecture: Layered (Actions → Services → Repositories → DB)*

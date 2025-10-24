# Technology Stack - TKZ

## Architecture Overview

TKZ follows a modern **full-stack React architecture** with server-side rendering, built on Next.js 15's App Router. The application uses a **layered architecture** pattern with clear separation between presentation, business logic, and data access layers.

### Architectural Principles
- **Server Components First**: Leverage React Server Components for initial page loads
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with client interactivity
- **API-as-Backend**: Next.js Server Actions and API Routes provide backend functionality
- **Type Safety**: Full TypeScript coverage from database to UI
- **Repository Pattern**: Abstract data access through dedicated repository layer
- **Result Type Pattern**: Functional error handling with `Result<T, E>` type

## Frontend Stack

### Core Framework
- **Next.js 15.5.6** (App Router)
  - React Server Components for optimal performance
  - Streaming and Suspense for progressive loading
  - Automatic code splitting
  - Built-in API routes

- **React 19.2.0**
  - Latest concurrent features
  - Server Actions integration
  - Enhanced hydration

- **TypeScript 5.9.3**
  - Strict mode enabled
  - Path aliases: `@/*` maps to project root
  - Comprehensive type definitions

### UI Framework & Styling
- **Tailwind CSS v4** (3.4.18 currently)
  - JIT (Just-In-Time) compilation
  - Custom design system via `tailwind.config.ts`
  - Responsive utilities (sm, md, lg, xl breakpoints)

- **shadcn/ui**
  - Radix UI primitives (@radix-ui/*)
  - Fully customizable components
  - Copy-paste component architecture

- **Component Library**:
  - `lucide-react` (0.546.0) - Icons
  - `motion` (12.23.24) - Animations via Framer Motion
  - `sonner` (2.0.7) - Toast notifications
  - `cmdk` (1.1.1) - Command menu palette

### State Management & Data Fetching
- **SWR 2.3.6**
  - Client-side data fetching and caching
  - Revalidation strategies
  - Optimistic UI updates

- **React Hook Form 7.65.0**
  - Form state management
  - Validation with Zod integration (@hookform/resolvers)

- **Custom Hooks**:
  - `use-debounce`: Search input optimization (300ms delay)
  - `use-auto-save-form`: Automatic form persistence
  - `use-unsaved-changes`: Navigation warnings
  - `use-session-management`: Auth session handling

## Backend Stack

### Runtime & Server
- **Next.js Server** (Node.js runtime)
  - Server Actions for mutations
  - API Routes for external integrations
  - Middleware for auth and redirects

### Database
- **PostgreSQL** (via Supabase)
  - Row Level Security (RLS) enabled
  - Optimized indexes for search performance
  - Soft delete pattern with `deleted_at` columns

- **Supabase Client** (@supabase/supabase-js 2.75.1)
  - `@supabase/ssr` (0.7.0) for SSR support
  - Environment-based configuration
  - Realtime subscriptions capability (not currently used)

### Authentication
- **NextAuth.js v5.0.0-beta.29**
  - Credentials provider for username/password
  - 24-hour session duration
  - Middleware-based route protection
  - Custom callbacks for user data injection
  - bcryptjs (3.0.2) for password hashing

### AI Integration
- **OpenAI API 6.5.0**
  - GPT-4 model for prompt generation
  - Streaming responses supported
  - Error handling and retry logic
  - Rate limiting consideration

## Development Environment

### Build Tools
- **Webpack** (via Next.js)
  - Custom webpack configuration in `next.config.ts`
  - Service Worker support via @serwist

- **PostCSS 8.5.6**
  - Autoprefixer (10.4.21)
  - Tailwind CSS processing
  - CSS nesting support

### Testing Framework
- **Vitest 3.2.4** (Unit & Integration Tests)
  - 122 tests (30 unit, 92 integration)
  - @vitest/ui for test visualization
  - jsdom (27.0.1) for DOM testing
  - @testing-library/react (16.3.0)
  - @testing-library/user-event (14.6.1)

- **Playwright 1.56.1** (E2E Tests)
  - 100+ cross-browser tests
  - Mobile viewport testing
  - Network mocking capability
  - Visual regression testing setup

### Code Quality
- **ESLint 9.38.0**
  - `eslint-config-next` for Next.js rules
  - TypeScript-aware linting

- **Prettier 3.6.2**
  - Consistent code formatting
  - Integration with ESLint

## Common Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm start                # Run production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Testing
npm test                 # Run unit/integration tests
npm run test:ui          # Visual test interface
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests
npm run test:e2e:ui      # E2E visual interface
npm run test:e2e:headed  # E2E with browser visible
npm run test:e2e:debug   # E2E debug mode

# Database
npm run db:seed          # Create initial users (TKZ, コボちゃん)
```

## Environment Variables

### Required Configuration

```bash
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=        # Public Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY=       # Server-side admin key (production)

# Authentication
NEXTAUTH_SECRET=                  # Generate: openssl rand -base64 32
NEXTAUTH_URL=                     # http://localhost:3000 (dev) or production URL

# AI Integration
OPENAI_API_KEY=                   # OpenAI API key (sk-...)
```

### Optional Configuration
```bash
NODE_ENV=                         # development | production | test
```

## Port Configuration

- **3000**: Default Next.js development server
- **3306**: PostgreSQL (via Supabase, not local)

## Security Measures

### Application Security
- ✅ NextAuth.js CSRF protection
- ✅ HTTP-only cookies for sessions
- ✅ bcrypt password hashing (10 rounds)
- ✅ Environment variable validation (Zod schemas)
- ✅ Input validation on all forms (Zod schemas)
- ✅ XSS protection via React's built-in escaping

### Database Security
- ✅ Row Level Security (RLS) policies on all tables
- ✅ Prepared statements (via Supabase client)
- ✅ Creator-only edit/delete permissions
- ✅ Soft delete pattern prevents data loss

### API Security
- ✅ Server Action authentication checks
- ✅ Rate limiting consideration (not yet implemented)
- ✅ CORS configuration (Next.js defaults)

## Performance Optimizations

### Current Optimizations
- ✅ React Server Components (reduces client JS)
- ✅ Automatic code splitting per route
- ✅ Tailwind CSS JIT compilation
- ✅ Image optimization (Next.js Image component ready)
- ✅ Database indexes on frequently queried columns
- ✅ Debounced search input (300ms)
- ✅ SWR caching for client-side data

### Bundle Sizes (Production)
```
Route                          Size      First Load JS
/                             1.07 kB    115 kB
/login                        2.54 kB    113 kB
/tools                        2.65 kB    172 kB
/tools/new                    3.11 kB    187 kB
/tools/[id]                   4.53 kB    140 kB
/tools/[id]/edit              5.47 kB    190 kB
/prompt                       4.43 kB    189 kB
/history                      3.97 kB    135 kB
/history/[id]                 3.36 kB    139 kB
```

## Browser Support

### Target Browsers
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Progressive Web App (PWA)
- Service Worker via @serwist/next
- Offline capability (not fully implemented)
- Add to home screen support

## Deployment Platform

### Vercel (Primary)
- Automatic deployments from Git
- Edge Network CDN
- Serverless Functions for API Routes
- Environment variable management
- Preview deployments for PRs

### Production URLs
- Production: `https://tkz-five.vercel.app` (or custom domain)
- Preview: Auto-generated per branch/PR

---

*Last Updated: 2025-10-23*
*Node Version: 18+ recommended*
*Package Manager: npm*

# AI Wave — Tech Stack

> **Version:** 3.0 (Template)
> **Last updated:** February 2026

---

## 1. Runtime & Language

| Layer | Runtime | Language | Version |
|-------|---------|----------|---------|
| Frontend + API Gateway | Bun | TypeScript | 1.3.x / TS 5.x |
| AI Agents | Python | Python | 3.12+ |

---

## 2. Frontend

| Aspect | Technology | Version |
|--------|------------|---------|
| Framework | Next.js | 16.x |
| Bundler | Turbopack | Included in Next.js 16 |
| Package Manager | Bun | 1.3.x |
| Rendering | Hybrid | SSR + SSG + ISR + CSR |

---

## 3. Styling & UI Components

| Aspect | Technology | Version |
|--------|------------|---------|
| CSS Framework | Tailwind CSS | 4.x |
| UI Primitives | Radix UI | 1.x |
| Component Library | shadcn/ui + Kibo UI | Latest |
| Data Tables | TanStack Table | 8.x |
| AI/Chat UI | Prompt-kit | Latest |
| Canvas/Workspace | tldraw SDK | Latest |
| Charts | EvilCharts | Latest |
| Animation | Framer Motion | 12.x |
| Icons | Huge Icons | Latest |

### Block/Template Libraries

- Blocks.so
- shadcnblocks
- HextaUI

---

## 4. State Management & Data Fetching

| Aspect | Technology | Version | Purpose |
|--------|------------|---------|---------|
| Global client state | Zustand | 5.x | UI state, user preferences |
| Server state/cache | TanStack Query | 5.x | Cache, retry, dedup, polling |
| Real-time | Supabase Realtime | Latest | CDC, broadcast, subscriptions |
| Forms | TanStack Form | 1.x | Form handling |
| Validation | Zod | 4.x | Schema validation |

---

## 5. Backend

| Layer | Technology | Purpose |
|-------|------------|---------|
| API Gateway | Hono (TypeScript/Bun) | Auth, rate limiting, routing, streaming |
| AI Agent API | FastAPI (Python) | Agent execution endpoints, webhooks |
| Background Workers | LangGraph + CrewAI (Python) | Agent orchestration, async processing |

### Core Libraries (TypeScript)

| Library | Purpose |
|---------|---------|
| Zod | Schema validation |
| date-fns | Date handling |
| nanoid | Short ID generation |
| jose | JWT handling |

### Core Libraries (Python)

| Library | Purpose |
|---------|---------|
| Pydantic | Schema validation |
| python-dateutil | Date handling |
| python-jose | JWT handling |

---

## 6. API Layer

| Aspect | Technology |
|--------|------------|
| API Type | REST (OpenAPI 3.1) |
| API Docs | Scalar |
| Versioning | URL prefix (`/api/v1/`) |

---

## 7. Databases

| Database | Type | Provider | Purpose |
|----------|------|----------|---------|
| Primary | PostgreSQL 15+ | Supabase | Persistent data, users, auth |
| Vector (RAG) | pgvector | Supabase (extension) | Embeddings, semantic search |
| Cache & Queues | Redis (serverless) | Upstash | Rate limiting, cache, job queues |
| Search | Full Text Search | PostgreSQL (native) | Content search |

| Aspect | Technology |
|--------|------------|
| ORM | Drizzle ORM |
| Connection Pooling | Supavisor (Supabase built-in) |

---

## 8. AI/ML Layer

| Aspect | Technology | Purpose |
|--------|------------|---------|
| Agent Orchestration | LangGraph (Python) | Deterministic workflow graphs |
| Agent Collaboration | CrewAI (Python) | Multi-agent collaborative tasks |
| Streaming UI | Vercel AI SDK | Text/UI streaming to frontend |
| LLM Providers | OpenAI, Anthropic, Google | Chat, completion, embeddings |
| Image Generation | Fal.ai, OpenAI Images | AI-generated visuals |
| Observability | Langfuse (self-hosted) | Traces, cost tracking, evals |
| Tool Integration | Composio | Unified API for 500+ external tools |

---

## 9. Auth & Security

| Aspect | Technology |
|--------|------------|
| Auth Provider | Clerk |
| DB Integration | Supabase (native Clerk integration) |
| Auth Methods | Email/Password, Google, Apple, Meta OAuth, Magic Link, MFA, Passkeys |
| Authorization | Supabase RLS + Clerk JWT |

---

## 10. Infrastructure & Deploy

| Category | Provider | Service |
|----------|----------|---------|
| Frontend Hosting | Vercel | Edge + Serverless |
| Backend Hosting | Railway | Containers (Python) |
| Database | Supabase | PostgreSQL + pgvector + Realtime |
| Cache | Upstash | Redis serverless |
| File Storage | Supabase Storage | Auth-integrated files |
| Heavy Assets | Cloudflare R2 | Zero egress fees |
| CDN / DNS / WAF | Cloudflare | Edge protection |
| Payments | Stripe | Billing + Subscriptions |
| Secrets | Infisical | Secret management |
| Feature Flags | Vercel Flags SDK | Gradual rollouts |

---

## 11. Developer Experience

| Aspect | Technology |
|--------|------------|
| Package Manager | Bun |
| Monorepo | Turborepo |
| Linter + Formatter | Biome |
| Pre-commit Hooks | Lefthook |
| Unit/Integration Tests | Vitest + Testing Library |
| E2E Tests | Playwright |
| AI Agent Tests | pytest + Langfuse evaluations |
| API Docs | OpenAPI 3.1 + Scalar |
| Internal Docs | Mintlify |
| Changelog | Changesets |
| CI/CD | GitHub Actions |
| Branching | GitHub Flow (main + feature branches) |

### Monorepo Structure

```
project/
├── apps/           # Deployment shells (web, api, agents)
├── domains/        # Business logic (screaming architecture)
├── infrastructure/ # Technical adapters (db, cache, auth, llm)
├── shared/         # Shared code (types, ui, utils, constants)
├── docs/           # ADRs, runbooks
└── scripts/        # CI/CD scripts
```

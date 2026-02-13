# Translato Production Deployment TODO (Vercel)

**Project:** Translato  
**Deploy Target:** Vercel (static SPA hosting) + Convex (backend/actions) + Clerk (auth)  
**Date:** February 13, 2026

## Summary

Opinionated production architecture:
1. Frontend is a static SPA built with Vite.
2. Bun server (`Bun.serve`) is not used in production.
3. Convex remains the backend for translation and app data.
4. Clerk migrates from development keys to production instance.
5. Only public-safe values (`VITE_*`) are exposed to the client.

## Prerequisites

- [ ] 🧑 HUMAN Confirm admin access to GitHub, Vercel, Convex, Clerk, DeepL, and DNS provider.
- [ ] 🧑 HUMAN Confirm production domain ownership and TLS ownership.
- [ ] 🧑 HUMAN Confirm data/privacy requirements for production environment.
- [ ] 🧑 HUMAN Confirm branch strategy (`main` production, PR previews enabled).
- [ ] 🧑 HUMAN Assign rollback owner and release approver.

## Phase 0: Prerequisites & Accounts (Effort: S)

Depends on: Prerequisites

- [ ] 🧑 HUMAN Create or verify production projects in Vercel, Convex, and Clerk.
- [ ] 🧑 HUMAN Enable MFA for all deploy/admin users.
- [ ] 🧑 HUMAN Establish shared secret custody and rotation ownership.
- [ ] 🧑🤖 BOTH Create service ownership matrix (human confirms, agent documents).

What can go wrong:
- Missing permissions block release.
- Wrong project selected (dev vs prod).
- No clear on-call ownership.

## Phase 1: Security Audit & Secret Rotation (Effort: M)

Depends on: Phase 0

- [ ] 🧑 HUMAN Rotate DeepL API key because the old key was present in local `.env`.
- [ ] 🧑 HUMAN Remove/revoke dev Clerk credentials from production contexts.
- [x] 🤖 AGENT Add/update deployment security checklist in docs.
- [x] 🤖 AGENT Define CSP, HSTS, referrer, frame, and MIME-protection headers in Vercel config.
- [ ] 🧑🤖 BOTH Validate allow-list (`INTERNAL_ALLOWED_EMAILS`, `INTERNAL_ALLOWED_DOMAINS`) against real production users.
- [x] 🤖 AGENT Verify all Convex mutation/action paths that require auth are gated (`requireUser` or equivalent).

What can go wrong:
- Rotated key not propagated everywhere.
- Overly strict CSP breaks Clerk/Convex.
- Allow-list misconfiguration causes lockout or overexposure.

## Phase 2: Build System Refactor (Bun.serve -> Static SPA + Vercel) (Effort: L)

Depends on: Phase 1

- [x] 🤖 AGENT Add Vite production build pipeline for React/TSX/CSS output to `dist/`.
- [x] 🤖 AGENT Add standard Vite root `index.html` entrypoint.
- [x] 🤖 AGENT Remove production dependency on Bun HTML imports and Bun routes.
- [x] 🤖 AGENT Remove frontend dependency on `/api/config`.
- [x] 🤖 AGENT Keep Convex as source of backend logic (translations stay in Convex actions).
- [x] 🤖 AGENT Configure SPA fallback rewrite on Vercel.

What can go wrong:
- Remaining Bun-only assumptions fail on Vercel build.
- Frontend still references removed API endpoints.
- Env resolution differences cause startup failures.

## Phase 3: Environment Variable Architecture (Effort: M)

Depends on: Phase 2

- [x] 🤖 AGENT Create `.env.example` with public vs server-only separation.
- [x] 🤖 AGENT Use canonical public client variables: `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`.
- [x] 🤖 AGENT Add runtime validation for required public env values.
- [ ] 🧑 HUMAN Configure Vercel env vars (Preview/Production scopes).
- [ ] 🧑 HUMAN Configure Convex production env vars (`DEEPL_API_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, allow-list values).
- [ ] 🧑🤖 BOTH Run built-asset secret-leak scan before production cutover.

What can go wrong:
- Secret value leaks into browser bundle.
- One environment missing a required var.
- Legacy env names still referenced.

## Phase 4: Clerk Production Setup (Effort: M)

Depends on: Phase 3

- [ ] 🧑 HUMAN Create Clerk production instance and app settings.
- [ ] 🧑 HUMAN Configure redirect URLs/origins for Vercel and custom domain.
- [ ] 🧑 HUMAN Create production keys (`pk_live_*`, secret key).
- [ ] 🧑🤖 BOTH Update Vercel/Convex envs to production Clerk values.
- [x] 🤖 AGENT Verify sign-in flow and appearance config with production keys.

What can go wrong:
- Redirect mismatch creates auth loops.
- Wrong issuer domain breaks Convex auth.
- OAuth provider configs incomplete.

## Phase 5: Convex Production Deployment (Effort: M)

Depends on: Phase 4

- [ ] 🧑 HUMAN Create/verify Convex production deployment target.
- [ ] 🧑 HUMAN Set required production env vars in Convex dashboard.
- [ ] 🧑🤖 BOTH Deploy schema/functions to production Convex and verify deployment target.
- [x] 🤖 AGENT Implement translation request throttling strategy.
- [x] 🤖 AGENT Verify auth-gating across mutations/actions.

What can go wrong:
- Deploy executed against wrong Convex environment.
- Rate limit policy too strict or too weak.
- Missing env vars only fail on production code paths.

## Phase 6: Vercel Project Setup & Configuration (Effort: M)

Depends on: Phase 5

- [ ] 🧑 HUMAN Create Vercel project and connect repository.
- [ ] 🧑🤖 BOTH Set build/output config for static Vite output.
- [ ] 🧑 HUMAN Set environment variables by scope.
- [x] 🤖 AGENT Add SPA rewrites and security headers in `vercel.json`.
- [ ] 🧑 HUMAN Enable Vercel Analytics in project settings.

What can go wrong:
- Incorrect output directory results in blank deployment.
- Incorrect rewrite rule breaks static assets.
- Missing env variables in one scope.

## Phase 7: Frontend Build Pipeline (Node/Vercel Compatible) (Effort: L)

Depends on: Phase 6

- [x] 🤖 AGENT Ensure scripts support Vercel Node build (`vite build`).
- [x] 🤖 AGENT Keep Bun local workflow while making production build Bun-independent.
- [x] 🤖 AGENT Add build verification command to CI gate.
- [x] 🤖 AGENT Validate `@vercel/analytics` initialization in production.
- [x] 🤖 AGENT Keep source maps enabled for debugging while avoiding secret exposure.

What can go wrong:
- Build tooling mismatch between local and Vercel.
- Build succeeds but runtime fails due env assumptions.
- Analytics initialized twice.

## Phase 8: Testing & Validation (Effort: M)

Depends on: Phase 7

- [x] 🤖 AGENT Run `bun run typecheck`.
- [x] 🤖 AGENT Run `bun run test`.
- [x] 🤖 AGENT Run production build check (`bun run build`).
- [ ] 🧑🤖 BOTH Execute preview smoke tests (auth, translate, usage, allow-list).
- [ ] 🧑 HUMAN Execute production smoke tests immediately after first deploy.

What can go wrong:
- No deploy-specific tests despite green unit tests.
- Preview checks skipped under release pressure.
- Allow-list behavior unverified in production.

## Phase 9: DNS & Custom Domain (Optional) (Effort: S)

Depends on: Phase 8

- [ ] 🧑 HUMAN Add domain in Vercel and configure DNS records.
- [ ] 🧑 HUMAN Update Clerk allowed origins/callback URLs for custom domain.
- [ ] 🧑 HUMAN Verify TLS issuance and forced HTTPS.

What can go wrong:
- DNS propagation delay interpreted as application outage.
- Clerk domain mismatch after cutover.
- Mixed content due to partial HTTPS configuration.

## Phase 10: Post-Deploy Verification & Monitoring (Effort: M)

Depends on: Phase 8 (and Phase 9 if domain cutover)

- [ ] 🧑🤖 BOTH Validate Vercel Analytics, Convex errors/logs, and Clerk auth telemetry.
- [ ] 🧑 HUMAN Configure alert channels and thresholds.
- [x] 🤖 AGENT Add runbook for auth/deploy/DeepL incidents.
- [ ] 🧑 HUMAN Perform 24h and 7d health reviews after first release.

What can go wrong:
- Metrics exist but no actionable alerts.
- No runbook leads to slow incident resolution.
- DeepL quota/rate issues detected too late.

## Phase 11: CI/CD Pipeline (Optional but Recommended) (Effort: M)

Depends on: Phase 7

- [x] 🤖 AGENT Add CI checks for typecheck, tests, and production build.
- [ ] 🧑 HUMAN Enforce required CI checks in branch protection.
- [ ] 🧑 HUMAN Enable Vercel PR preview deployments.
- [x] 🤖 AGENT Add scheduled dependency/security checks.

What can go wrong:
- CI does not mirror Vercel build assumptions.
- Branch protection does not enforce checks.
- Preview environments exist but are not used for approvals.

## Appendix A: `.env.example` Template

```env
# Frontend (public-safe)
VITE_CONVEX_URL=
VITE_CLERK_PUBLISHABLE_KEY=

# Convex backend (server-only)
DEEPL_API_KEY=
CLERK_JWT_ISSUER_DOMAIN=
INTERNAL_ALLOWED_EMAILS=
INTERNAL_ALLOWED_DOMAINS=

# Optional local tooling
CLERK_SECRET_KEY=
```

## Appendix B: Production Architecture (ASCII)

```text
+-------------------+            +------------------+
|   End User Browser|            |     Clerk        |
| React SPA (Vercel)|<---------->| Auth + Sessions  |
+---------+---------+            +------------------+
          |
          | Convex client (HTTPS/WebSocket)
          v
+-------------------+            +------------------+
|      Convex       |----------->|      DeepL       |
| Queries/Mutations |  API call  | Translation API  |
| Actions + AuthZ   |            +------------------+
+-------------------+
```

## Appendix C: Rollback Plan

- [ ] 🧑 HUMAN Roll back Vercel to previous good deployment.
- [ ] 🧑 HUMAN Roll back Convex deployment if needed.
- [ ] 🧑 HUMAN Restore last known-good environment variable set.
- [ ] 🧑🤖 BOTH Re-run smoke test suite after rollback.
- [ ] 🧑🤖 BOTH Publish incident timeline and prevention actions.

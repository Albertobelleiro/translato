# Translato Production Deploy Runbook

## Scope

This runbook covers the first production rollout to Vercel (static SPA), Convex (backend), and Clerk (auth).

## Ownership Matrix

| Service | Primary Owner | Backup Owner | Escalation |
|---|---|---|---|
| Vercel project/deployments | `TODO` | `TODO` | `TODO` |
| Convex deployment/env vars | `TODO` | `TODO` | `TODO` |
| Clerk production auth config | `TODO` | `TODO` | `TODO` |
| DeepL key/billing/quota | `TODO` | `TODO` | `TODO` |
| DNS + TLS | `TODO` | `TODO` | `TODO` |

## Pre-Deploy Checklist

- [ ] DeepL API key rotated and old key revoked.
- [ ] Clerk production instance created with production keys.
- [ ] Convex production deployment exists and env vars are set.
- [ ] Vercel project env vars set:
  - [ ] `VITE_CONVEX_URL`
  - [ ] `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] Convex env vars set:
  - [ ] `DEEPL_API_KEY`
  - [ ] `CLERK_JWT_ISSUER_DOMAIN`
  - [ ] `INTERNAL_ALLOWED_EMAILS`
  - [ ] `INTERNAL_ALLOWED_DOMAINS`
- [ ] CI green (`Typecheck & Test`, `Build (Vite on Node)`).

## Release Steps

1. Deploy Convex production functions/schema.
2. Deploy Vercel production build from `main`.
3. Run smoke tests.
4. Confirm monitoring baselines.

## Smoke Tests

1. Auth:
   - [ ] Sign in with allow-listed account.
   - [ ] Sign out and sign in again.
2. Authorization:
   - [ ] Verify non-allow-listed account is blocked.
3. Translation:
   - [ ] Translate EN -> ES.
   - [ ] Translate ES -> EN.
   - [ ] Confirm error rendering for invalid/empty input.
4. Usage:
   - [ ] Confirm usage stats update after translation.
5. Routing:
   - [ ] Deep-link refresh does not 404.

## Incident Runbook

### Auth outage
- Validate Clerk publishable key in Vercel env.
- Validate `CLERK_JWT_ISSUER_DOMAIN` in Convex env.
- Verify Clerk redirect URLs include production origin.

### Translation failures
- Check Convex action logs for translation errors.
- Verify `DEEPL_API_KEY` is set and not expired.
- Check DeepL quota/rate-limit dashboard.

### Access-control failures
- Validate `INTERNAL_ALLOWED_EMAILS` and `INTERNAL_ALLOWED_DOMAINS`.
- Re-test with known allow-listed account.

## Rollback

1. Roll back Vercel to previous known-good deployment.
2. Roll back Convex to previous known-good deployment.
3. Restore last known-good env values if config drift caused outage.
4. Re-run smoke tests.
5. Publish incident summary with action items.

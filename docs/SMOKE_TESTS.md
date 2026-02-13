# Translato Smoke Tests (Preview + Production)

## Preconditions

- Deployment URL is reachable.
- Vercel env vars are set:
  - `VITE_CONVEX_URL`
  - `VITE_CLERK_PUBLISHABLE_KEY`
- Convex env vars are set:
  - `DEEPL_API_KEY`
  - `CLERK_JWT_ISSUER_DOMAIN`
  - `INTERNAL_ALLOWED_EMAILS`
  - `INTERNAL_ALLOWED_DOMAINS`

## Preview Smoke Test

1. Open preview URL.
2. Sign in with allow-listed account.
3. Verify app loads (no initialization/config error message).
4. Translate `Hello world` to Spanish and verify output appears.
5. Translate `Hola mundo` to English and verify output appears.
6. Refresh a deep path (if using client route) and verify no 404.
7. Sign out and verify sign-in view returns.

## Authorization Negative Test

1. Sign in with non-allow-listed account.
2. Verify access is blocked with "Access restricted" UI.

## Production Smoke Test (Immediately after first deploy)

1. Repeat Preview Smoke Test.
2. Validate Vercel Analytics receives page view.
3. Validate Convex dashboard shows successful translation action invocations.
4. Validate no spike in Convex action errors.

## Rollback Verification

1. Roll back deployment in Vercel.
2. Repeat Preview Smoke Test against rolled-back deployment.
3. Confirm sign-in and translation still function.

# Administrator login

The initial credential is stored as a server-only scrypt hash in
`server/admin-auth.ts`. Netlify's `ADMIN_PIN` environment variable is no longer
used. Never import this module in `src/` or put a plaintext password in the repo.

## Deployment

1. Deploy this change using the Vite-only build configured in `netlify.toml`.
   If a UI build override exists, use `bunx --no-install vite build` and publish
   `dist`. Keep Netlify secrets scanning enabled.
2. After the new deployment succeeds, remove the obsolete `ADMIN_PIN` variable
   from Netlify (Production and Deploy Previews). It is no longer required.
3. If no password was previously saved, use the original bootstrap password,
   then immediately use **관리자 비밀번호 변경** in the login dialog to replace it.
   The original bootstrap password was previously public; do not keep using it.
4. If a password was already saved in `academy-admin/credential`, use that saved
   password. Deployment does not delete or override existing credentials.

Password changes are hashed with a fresh salt and written to Netlify Blobs.
Production uses the site-wide store, so a redeploy does not reset the password.
Concurrent writes are checked with ETags. Storage failures reject authentication
and display a server/storage error; they never enable a bootstrap bypass.
Netlify still runs the server-side Function and provides persistent storage.
A purely static site cannot securely authenticate administrators or retain
password changes by itself.

If a saved password is lost, it needs a separate authenticated owner recovery
procedure. Changing an environment variable or redeploying does not reset it.
Do not add a public reset endpoint or re-enable the initial password as a bypass.

Local `npm run dev` uses the same verification and password rules, but local
password changes are in memory and reset when that process restarts.

## Verification

- `npm run lint`
- `node --import tsx --experimental-test-module-mocks --test tests/admin-auth.test.mjs`
- `bunx --no-install vite build`

The API regression tests mock Netlify Blobs. They cover bootstrap login, wrong
passwords, ignoring ADMIN_PIN, password changes, rejection of the old password,
existing credentials, concurrent updates, and storage errors. Production Netlify
connectivity must still be checked after deployment.

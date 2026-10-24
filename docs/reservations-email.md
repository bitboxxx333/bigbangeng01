# Reservations and email on Netlify

## Reservation persistence

Both booking forms POST to `/api/reservations`. A booking is shown as complete
only after the Function confirms the stored record. API, network, and HTML
fallback errors are shown as failures, never converted to local-only bookings.
The administrator ledger uses authenticated server records, not a merge of
unverified browser-local entries. Production records are in the persistent
`academy-reservations` Netlify Blobs store.

Old `bigbang_reservations` browser data is left untouched but is no longer used
as authoritative bookings. It is not automatically uploaded: those records may
be failed attempts or duplicates of server bookings. Recover any old local-only
bookings separately after checking the real ledger.

## Configure email when ready

1. Deploy this branch; keep `dist` as the publish directory and use the Vite-only
   build command in `netlify.toml`.
2. In the website administrator dashboard, open notifications. Enter the email
   address and click **이메일 설정 저장**. Email alone does not enable delivery.
3. When ready, obtain a Web3Forms Access Key for that recipient address, input it
   in the same card, enable email alerts, and save. The key determines the actual
   recipient: the text email field cannot redirect a different recipient's key.
4. Click the test email button and check the inbox/spam folder. The application
   reports provider acceptance, not confirmed inbox delivery.

The settings are saved in the server-side `academy-admin/email-settings` blob,
so visitors use the same settings regardless of device. GET settings returns
only the configured status, never the key. Existing keys are preserved when the
input is left blank. Changing recipient requires entering its corresponding key.
No email credentials belong in the GitHub repository or browser localStorage.

After a reservation is stored, the Function sends a plain-text Web3Forms request
with an eight-second timeout and records `accepted`, `failed`, `not_configured`,
or `disabled`. The administrator ledger displays that state. Email failures do
not roll back the saved reservation. Failed sends are not automatically retried;
use the saved ledger to follow up. A network error after submission may mean the
reservation was saved; check before resubmitting to avoid duplicates.

No real email was sent during automated verification. Tests mock storage and
provider responses. Netlify storage connectivity and real inbox delivery still
require a post-deployment check. The old Netlify Forms/browser email fallback
has been removed; this path uses the Function and Web3Forms only. Local Express
runs have in-memory bookings and do not implement these persisted email settings.

## Checks

```sh
npm run lint
node --import tsx --experimental-test-module-mocks --test tests/*.test.mjs
bunx --no-install vite build
```

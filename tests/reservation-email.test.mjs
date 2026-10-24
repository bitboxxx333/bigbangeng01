import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

const stores = new Map();
let failWrites = false;
let failEmailSettings = false;
let providerCalls = 0;
let providerFailure = false;
let providerBody;
const originalFetch = globalThis.fetch;
const pin = ['admin', '75', '25'].join('');
const fakeKey = '11111111-1111-4111-8111-111111111111';
const storage = (name) => {
  if (!stores.has(name)) stores.set(name, new Map());
  const records = stores.get(name);
  return {
    async get(key) { if (key === 'email-settings' && failEmailSettings) throw Error('email settings offline'); return structuredClone(records.get(key) ?? null); },
    async getWithMetadata(key) { return records.has(key) ? { data: structuredClone(records.get(key)), etag: 'version' } : null; },
    async setJSON(key, value, options) {
      if (failWrites) throw Error('storage offline');
      if (options?.onlyIfNew && records.has(key)) return { modified: false };
      records.set(key, structuredClone(value)); return { modified: true };
    },
    async list() { return { blobs: [...records.keys()].map(key => ({key})) }; },
  };
};
mock.module('@netlify/blobs', { exports: { getStore: ({name}) => storage(name), getDeployStore: ({name}) => storage(`preview:${name}`) } });
const { default: handler } = await import('../netlify/functions/academy-api.ts');
const { createReservation } = await import('../src/utils/reservationApi.ts');
const { sendReservationEmail, defaultEmailSettings } = await import('../server/reservation-email.ts');
const input = { studentName: 'TEST-예약', parentPhone: '010-0000-0000', school: '테스트학교', grade: '고1', concerns: ['테스트'], preferredDate: '2026-11-01', preferredTime: '18:00', notes: '실발송 없는 테스트' };
const request = (path, method = 'GET', body, authorized = false) => handler(new Request(`https://test.example/api/${path}`, {
  method, headers: { 'Content-Type': 'application/json', origin: 'https://test.example', ...(authorized ? {'x-admin-pin':pin} : {}) },
  body: body === undefined ? undefined : JSON.stringify(body),
}));

test('reservation persistence and server-side email', async (t) => {
  delete process.env.CONTEXT;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.web3forms.com/submit');
    providerCalls++;
    providerBody = JSON.parse(options.body);
    return Response.json({ success: !providerFailure }, { status: providerFailure ? 400 : 200 });
  };
  try {
    await t.test('email settings require administrator authentication', async () => {
      assert.equal((await request('admin/email-settings')).status, 401);
      assert.equal((await request('admin/test-email', 'POST', {})).status, 401);
    });
    await t.test('booking is saved and independently retrievable without email credentials', async () => {
      const response = await request('reservations', 'POST', input);
      assert.equal(response.status, 201);
      const saved = (await response.json()).reservation;
      assert.equal(saved.emailNotification.status, 'not_configured');
      const listing = await (await request('reservations', 'GET', undefined, true)).json();
      assert.equal(listing.reservations[0].id, saved.id);
      assert.equal(providerCalls, 0);
    });
    await t.test('public listings do not expose booking details or settings', async () => {
      const listing = await (await request('reservations')).json();
      assert.equal(listing.count, 1);
      assert.equal(listing.reservations, undefined);
    });
    await t.test('invalid and failed saves do not report success or send email', async () => {
      assert.equal((await request('reservations', 'POST', { ...input, parentPhone: 'bad' })).status, 400);
      failWrites = true;
      assert.equal((await request('reservations', 'POST', input)).status, 503);
      failWrites = false;
      assert.equal(providerCalls, 0);
    });
    await t.test('email-only configuration is saved but cannot claim mail was sent', async () => {
      assert.equal((await request('admin/email-settings', 'PATCH', { recipientEmail:'test@example.com', enabled:true }, true)).status, 200);
      const testResponse = await request('admin/test-email', 'POST', {}, true);
      assert.equal(testResponse.status, 503);
      assert.equal((await testResponse.json()).status, 'not_configured');
      assert.equal(providerCalls, 0);
    });
    await t.test('key is persisted server-side and never returned by settings GET', async () => {
      assert.equal((await request('admin/email-settings', 'PATCH', { recipientEmail:'test@example.com', enabled:true, web3FormsKey:fakeKey }, true)).status, 200);
      const settings = await (await request('admin/email-settings', 'GET', undefined, true)).json();
      assert.equal(settings.configured, true);
      assert.equal(settings.web3FormsKey, undefined);
    });
    await t.test('a different visitor triggers provider using shared server settings', async () => {
      const response = await request('reservations', 'POST', input);
      assert.equal(response.status, 201);
      const saved = (await response.json()).reservation;
      assert.equal(saved.emailNotification.status, 'accepted');
      assert.equal(providerCalls, 1);
      assert.equal(providerBody.access_key, fakeKey);
      assert.ok(providerBody.message.includes(saved.id));
      const stored = stores.get('academy-reservations').get(saved.id);
      assert.equal(stored.emailNotification.status, 'accepted');
      assert.ok(!JSON.stringify(saved).includes(fakeKey));
    });
    await t.test('provider failure preserves booking and exposes honest notification state', async () => {
      providerFailure = true;
      const response = await request('reservations', 'POST', input);
      assert.equal(response.status, 201);
      const saved = (await response.json()).reservation;
      assert.equal(saved.emailNotification.status, 'failed');
      assert.ok(stores.get('academy-reservations').has(saved.id));
      providerFailure = false;
    });
    await t.test('email settings failure also preserves booking', async () => {
      failEmailSettings = true;
      const response = await request('reservations', 'POST', input);
      assert.equal(response.status, 201);
      assert.equal((await response.json()).reservation.emailNotification.status, 'failed');
      failEmailSettings = false;
    });
    await t.test('recipient changes require a new recipient-bound key', async () => {
      assert.equal((await request('admin/email-settings', 'PATCH', { recipientEmail:'other@example.com', enabled:true }, true)).status, 400);
    });
    await t.test('disabled notifications and network errors do not claim success', async () => {
      const reservation = { ...input, id:'test', concerns:[] };
      assert.equal((await sendReservationEmail(reservation, { ...defaultEmailSettings, enabled:false })).status, 'disabled');
      globalThis.fetch = async () => { throw Error('network unavailable'); };
      assert.equal((await sendReservationEmail(reservation, { ...defaultEmailSettings, web3FormsKey:fakeKey })).status, 'failed');
    });
    await t.test('client never fabricates a booking for HTTP errors, HTML, or network failures', async () => {
      for (const response of [Response.json({error:'save failed'}, {status:503}), new Response('<html>fallback</html>')]) {
        globalThis.fetch = async () => response;
        await assert.rejects(createReservation(input));
      }
      globalThis.fetch = async () => { throw Error('network unavailable'); };
      await assert.rejects(createReservation(input));
      globalThis.fetch = async () => Response.json({reservation:{...input, id:'saved-id'}}, {status:201});
      assert.equal((await createReservation(input)).id, 'saved-id');
    });
  } finally { globalThis.fetch = originalFetch; }
});

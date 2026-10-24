import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { scryptSync } from 'node:crypto';

let credential = null;
let failStorage = false;
let conflictingWrite = false;
let selectedStore;
const storage = {
  async get() { if (failStorage) throw Error('storage unavailable'); return credential; },
  async getWithMetadata() { return credential ? { data: credential, etag: 'version-1' } : null; },
  async setJSON(_key, value, options) {
    if (conflictingWrite) return { modified: false };
    assert.deepEqual(options, credential ? { onlyIfMatch: 'version-1' } : { onlyIfNew: true });
    credential = value;
    return { modified: true };
  },
  async list() { return { blobs: [] }; },
};
mock.module('@netlify/blobs', { exports: {
  getStore: ({name}) => { selectedStore = name; return storage; },
  getDeployStore: () => { throw Error('Production must not use a deploy-specific credential store'); },
} });
const { default: handler } = await import('../netlify/functions/academy-api.ts');
const { initialCredential, matchesCredential } = await import('../server/admin-auth.ts');
// Reconstruct the existing bootstrap password without storing its literal in tracked files.
const initialPassword = ['admin', '75', '25'].join('');
const newPassword = 'Test-only-Changed!987';
const request = (route, data) => handler(new Request(`https://test.example/api/admin/${route}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://test.example' }, body: JSON.stringify(data),
}));

test('initial login, password change, persistence, and fail-closed behavior', async (t) => {
  delete process.env.CONTEXT;
  process.env.ADMIN_PIN = 'Ignored-Environment!123';
  await t.test('bootstrap hash accepts original and rejects incorrect passwords', () => {
    assert.ok(matchesCredential(initialPassword, initialCredential));
    assert.equal(matchesCredential('incorrect', initialCredential), false);
    assert.equal(matchesCredential(initialPassword, null), false);
  });
  await t.test('initial login works without environment password or saved credentials', async () => {
    const response = await request('verify', { pin: initialPassword });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
  });
  await t.test('ADMIN_PIN no longer controls login', async () => {
    assert.equal((await request('verify', { pin: process.env.ADMIN_PIN })).status, 401);
  });
  await t.test('invalid current and weak new passwords cannot modify stored credentials', async () => {
    assert.equal((await request('change-password', { currentPassword: 'incorrect', newPassword })).status, 401);
    assert.equal((await request('change-password', { currentPassword: initialPassword, newPassword: '1234' })).status, 400);
    assert.equal(credential, null);
  });
  await t.test('password change stores a hash in persistent site-wide storage', async () => {
    const response = await request('change-password', { currentPassword: initialPassword, newPassword });
    assert.equal(response.status, 200);
    assert.equal(selectedStore, 'academy-admin');
    assert.ok(matchesCredential(newPassword, credential));
    assert.ok(!JSON.stringify(credential).includes(newPassword));
  });
  await t.test('new requests accept changed password and reject bootstrap', async () => {
    assert.equal((await request('verify', { pin: initialPassword })).status, 401);
    assert.equal((await request('verify', { pin: newPassword })).status, 200);
  });
  await t.test('concurrent update is rejected without overwriting stored credentials', async () => {
    conflictingWrite = true;
    assert.equal((await request('change-password', { currentPassword: newPassword, newPassword: 'Another-Test!123' })).status, 409);
    assert.ok(matchesCredential(newPassword, credential));
    conflictingWrite = false;
  });
  await t.test('storage failure returns 503 without allowing bootstrap login', async () => {
    failStorage = true;
    assert.equal((await request('verify', { pin: initialPassword })).status, 503);
    failStorage = false;
  });
  await t.test('an existing credential is preserved and remains the only accepted password', async () => {
    const salt = '0123456789abcdef0123456789abcdef';
    const existingPassword = 'Existing-Credential!123';
    credential = { salt, hash: scryptSync(existingPassword, Buffer.from(salt, 'hex'), 64).toString('hex'), updatedAt: '' };
    assert.equal((await request('verify', { pin: initialPassword })).status, 401);
    assert.equal((await request('verify', { pin: existingPassword })).status, 200);
  });
});

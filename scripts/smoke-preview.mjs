import assert from 'node:assert/strict';

const base = process.env.PREVIEW_URL || 'http://localhost:3000';
async function request(path, body, cookie) {
  return fetch(`${base}/api/v1${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

for (const path of ['/', '/about', '/login', '/register', '/account']) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
  console.log(`PASS page ${path}`);
}
let response = await request('/auth/me');
assert.equal(response.status, 401);
assert.equal((await response.json()).error.code, 'UNAUTHENTICATED');
response = await request('/auth/login', { email: 'bad', password: '' });
assert.equal(response.status, 400);
assert.equal((await response.json()).error.code, 'VALIDATION_FAILED');
response = await request('/auth/login', { email: 'superadmin@church.test', password: 'wrong' });
assert.equal(response.status, 401);
console.log('PASS unauthenticated, validation and invalid-password errors');

response = await request('/auth/login', { email: 'superadmin@church.test', password: 'Test@1234' });
assert.equal(response.status, 201);
const cookieHeader = response.headers.get('set-cookie');
assert.match(cookieHeader, /HttpOnly/i);
assert.match(cookieHeader, /Path=\//i);
const cookie = cookieHeader.split(';')[0];
const login = await response.json();
assert.equal(login.user.email, 'superadmin@church.test');
assert.equal(login.token, undefined);
response = await request('/auth/me', undefined, cookie);
assert.equal(response.status, 200);
assert.equal((await response.json()).user.id, login.user.id);
response = await request('/auth/logout', {}, cookie);
assert.equal(response.status, 201);
assert.match(response.headers.get('set-cookie'), /Path=\//i);
response = await request('/auth/me', undefined, cookie);
assert.equal(response.status, 401);
console.log('PASS login, authenticated account, logout and revoked session');

const email = `preview-${Date.now()}@church.test`;
response = await request('/auth/register', { fullName: 'Preview Member', email, password: 'Preview@1234' });
assert.equal(response.status, 201);
const registrationCookie = response.headers.get('set-cookie').split(';')[0];
const registration = await response.json();
assert.equal(registration.user.email, email);
assert.deepEqual(registration.user.roles, ['member']);
response = await request('/auth/register', { fullName: 'Preview Member', email, password: 'Preview@1234' });
assert.equal(response.status, 409);
await request('/auth/logout', {}, registrationCookie);
console.log('PASS registration, default member role and duplicate email');
console.log('All local preview smoke checks passed.');

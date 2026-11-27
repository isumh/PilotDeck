import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createRequestContextMiddleware, withAuthenticatedRequest, authenticatedRequestContext } from './requestContext';
import { currentRequestContext, requestContextHeaders } from '../../../src/network/requestContext';
import { requestLimiters } from './rateLimits.js';

const home = mkdtempSync(join(tmpdir(), 'eastyundesk-web-headers-'));
const oldHome = process.env.EASTYUN_HOME;
let server; let url;
beforeAll(async () => {
  process.env.EASTYUN_HOME = home;
  const app = express();
  app.use(requestLimiters.ingress);
  app.use(express.json());
  app.use(createRequestContextMiddleware(async name => name === 'registered-project' ? '/private/customer' : undefined));
  app.use((req, res, next) => { req.user = { id: req.headers['test-auth-user'] || 1 }; withAuthenticatedRequest(req, res, next); });
  // Match mount-level plus route-level authentication used by /api/projects.
  app.use('/api/projects', (req, res, next) => {
    res.locals.firstContext = { ...req.requestContext };
    withAuthenticatedRequest(req, res, next);
  });
  app.get('/api/projects', withAuthenticatedRequest, async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 5));
    res.json({ firstContext: res.locals.firstContext, context: req.requestContext,
      modelHeaders: requestContextHeaders({ purpose: 'model-probe' }) });
  });
  app.all('/api/test', async (_req, res) => {
    await new Promise(resolve => setTimeout(resolve, 5));
    res.json({ context: currentRequestContext(), modelHeaders: requestContextHeaders({ purpose: 'model-probe' }) });
  });
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  url = `http://127.0.0.1:${server.address().port}/api/test`;
});
afterAll(async () => {
  server?.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  if (oldHome === undefined) delete process.env.EASTYUN_HOME; else process.env.EASTYUN_HOME = oldHome;
  rmSync(home, { recursive: true, force: true });
});
describe('server attribution boundary', () => {
  it.each(['provided', 'missing', 'invalid'])('keeps repeated authentication idempotent with a %s request ID', async mode => {
    const requestId = randomUUID();
    const deviceId = randomUUID();
    const sessionId = randomUUID();
    const response = await fetch(`${url.replace('/api/test', '/api/projects')}?sessionId=${sessionId}&projectName=registered-project`, { headers: {
      ...(mode === 'missing' ? {} : { 'x-eastyundesk-request-id': mode === 'provided' ? requestId : 'invalid value' }),
      'x-eastyundesk-device-id': deviceId, 'x-eastyundesk-version': '2026.10.29',
    } });
    expect(response.status).toBe(200);
    const correlation = response.headers.get('x-eastyundesk-request-id');
    expect(correlation).toMatch(/^[a-f0-9-]{36}$/);
    if (mode === 'provided') expect(correlation).toBe(requestId);
    const { firstContext, context, modelHeaders } = await response.json();
    expect(context).toEqual(firstContext);
    expect(context.requestId).toBe(correlation);
    expect(context.parentRequestId).toBe(correlation);
    expect(modelHeaders['x-eastyundesk-parent-request-id']).toBe(correlation);
    expect(modelHeaders['x-eastyundesk-user-id']).toBe(response.headers.get('x-eastyundesk-user-id'));
    expect(modelHeaders['x-eastyundesk-project-id']).toBe(response.headers.get('x-eastyundesk-project-id'));
    expect(modelHeaders['x-eastyundesk-device-id']).toBe(deviceId);
    expect(modelHeaders['x-eastyundesk-session-id']).toBe(sessionId);
    expect(modelHeaders['x-eastyundesk-client-version']).toBe('2026.10.29');
  });
  it('resolves registered project names to the same opaque ID as direct paths', async () => {
    const named = await fetch(`${url}?projectName=registered-project`);
    const direct = await fetch(`${url}?projectPath=/private/customer`);
    expect(named.headers.get('x-eastyundesk-project-id')).toBeTruthy();
    expect(named.headers.get('x-eastyundesk-project-id')).toBe(direct.headers.get('x-eastyundesk-project-id'));
  });
  it('replaces spoofed users with authenticated identity and correlates the model request', async () => {
    const requestId = randomUUID(); const deviceId = randomUUID(); const sessionId = randomUUID();
    const response = await fetch(`${url}?sessionId=${sessionId}&projectPath=/private/customer`, { headers: {
      'x-eastyundesk-user-id': 'f'.repeat(32), 'x-eastyundesk-request-id': requestId, 'x-eastyundesk-device-id': deviceId,
    } });
    const { modelHeaders } = await response.json();
    expect(response.headers.get('x-eastyundesk-request-id')).toBe(requestId);
    expect(modelHeaders['x-eastyundesk-parent-request-id']).toBe(requestId);
    expect(modelHeaders['x-eastyundesk-user-id']).toBe(response.headers.get('x-eastyundesk-user-id'));
    expect(modelHeaders['x-eastyundesk-user-id']).not.toBe('f'.repeat(32));
    expect(modelHeaders['x-eastyundesk-device-id']).toBe(deviceId);
    expect(modelHeaders['x-eastyundesk-session-id']).toBe(sessionId);
    expect(JSON.stringify(modelHeaders)).not.toContain('/private/customer');
  });
  it('isolates concurrent authenticated users and rejects malformed diagnostic paths without failing requests', async () => {
    const [a, b] = await Promise.all(['alice', 'bob'].map(async user => (await fetch(url, { method: 'POST', headers: { 'test-auth-user': user, 'content-type': 'application/json' }, body: JSON.stringify({ projectPath: { bad: true } }) })).json()));
    expect(a.modelHeaders['x-eastyundesk-user-id']).not.toBe(b.modelHeaders['x-eastyundesk-user-id']);
    expect(a.modelHeaders['x-eastyundesk-project-id']).toBeUndefined();
  });
  it('ignores user identifiers from WebSocket client payloads', () => {
    const context = authenticatedRequestContext('alice', { userId: 'attacker', deviceId: randomUUID(), requestId: randomUUID() });
    expect(context.userId).toMatch(/^[a-f0-9]{32}$/);
    expect(context.userId).toBe(authenticatedRequestContext('alice').userId);
  });
});

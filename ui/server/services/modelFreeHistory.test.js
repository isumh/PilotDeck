import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { it, expect } from 'vitest';
import { createAgentProjectSessionStorage } from '../../../src/session/index.js';
import { createModelFreeHistory } from './modelFreeHistory.js';

it('lists and reads existing conversations without loading a model or starting Gateway', async () => {
  const eastyunHome = await mkdtemp(join(tmpdir(), 'eastyundesk-empty-history-'));
  try {
    const sessionKey = 'web:s_saved';
    const storage = createAgentProjectSessionStorage({ projectRoot: eastyunHome, eastyunHome, sessionId: sessionKey });
    await storage.transcript.recordAcceptedInput(sessionKey, 'turn-1', [{ role: 'user', content: [{ type: 'text', text: 'saved question' }] }]);
    await storage.transcript.recordDurableMessage(sessionKey, 'turn-1', { role: 'assistant', content: [{ type: 'text', text: 'saved answer' }] });
    const reader = createModelFreeHistory({ eastyunHome, projectRoot: eastyunHome });
    const sessions = await reader.listSessions({ projectKey: eastyunHome, limit: 5 });
    expect(sessions.sessions).toHaveLength(1);
    expect((await reader.describeProject({ projectKey: eastyunHome })).sessionCount).toBe(1);
    const history = await reader.readSessionMessages({ projectKey: eastyunHome, sessionKey });
    expect(JSON.stringify(history.messages)).toContain('saved question');
    expect(JSON.stringify(history.messages)).toContain('saved answer');
    expect(reader.submitTurn).toBeUndefined();
  } finally { await rm(eastyunHome, { recursive: true, force: true }); }
});

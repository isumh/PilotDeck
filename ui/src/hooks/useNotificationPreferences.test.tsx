// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => { window.eastyundeskDesktop = undefined; localStorage.clear(); vi.resetModules(); });
it('new desktop installs start enabled before native settings load', async () => {
  window.eastyundeskDesktop = { platform: 'win32' } as any;
  const { getNotificationPreferences } = await import('./useNotificationPreferences');
  expect(getNotificationPreferences().enabled).toBe(true);
});
it('preserves explicit desktop opt-out and leaves browser permission opt-in intact', async () => {
  window.eastyundeskDesktop = { platform: 'win32' } as any;
  localStorage.setItem('eastyundesk-notifications-v1', JSON.stringify({ enabled: false }));
  expect((await import('./useNotificationPreferences')).getNotificationPreferences().enabled).toBe(false);
  vi.resetModules(); localStorage.clear(); window.eastyundeskDesktop = undefined;
  expect((await import('./useNotificationPreferences')).getNotificationPreferences().enabled).toBe(false);
});

// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { clearWebNotificationBadge } from './systemNotifications';

afterEach(() => { window.eastyundeskDesktop = undefined; vi.restoreAllMocks(); document.title = 'EastYunDesk'; });
it('removes legacy web title counts and clears PWA badges without publishing a new count', async () => {
  document.title = '(9) EastYunDesk';
  const clear = vi.fn(async () => {});
  const set = vi.fn(async () => {});
  Object.defineProperty(navigator, 'clearAppBadge', { value: clear, configurable: true });
  Object.defineProperty(navigator, 'setAppBadge', { value: set, configurable: true });
  await clearWebNotificationBadge();
  expect(document.title).toBe('EastYunDesk');
  expect(clear).toHaveBeenCalledOnce();
  expect(set).not.toHaveBeenCalled();
  delete (navigator as any).clearAppBadge;
  delete (navigator as any).setAppBadge;
  await expect(clearWebNotificationBadge()).resolves.toBeUndefined();
});
it('leaves desktop badge ownership with the main process', async () => {
  window.eastyundeskDesktop = { platform: 'linux' } as NonNullable<Window['eastyundeskDesktop']>;
  const clear = vi.fn(async () => {});
  Object.defineProperty(navigator, 'clearAppBadge', { value: clear, configurable: true });
  await clearWebNotificationBadge();
  expect(clear).not.toHaveBeenCalled();
  delete (navigator as any).clearAppBadge;
});

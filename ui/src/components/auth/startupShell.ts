import type { StartupTiming } from '../../../../apps/desktop/src/startupPresentation';

export function hasStartupShell() {
  return Boolean(window.__eastyundeskStartupUpdate && document.getElementById('startup'));
}

export function updateStartupShell(state: StartupTiming, language: string, leaving: boolean) {
  const element = document.getElementById('startup');
  if (!element || !window.__eastyundeskStartupUpdate) return;
  element.style.visibility = 'visible';
  window.__eastyundeskStartupUpdate({ ...state, language, leaving });
}

export function hideStartupShell() {
  const element = document.getElementById('startup');
  if (element) element.style.visibility = 'hidden';
}

export function releaseStartupShell() {
  window.__eastyundeskStartupCleanup?.();
  document.getElementById('eastyundesk-startup-shell')?.remove();
  delete window.__eastyundeskStartupCleanup;
  delete window.__eastyundeskStartupUpdate;
}

import { contextBridge, ipcRenderer, webFrame, type IpcRendererEvent } from "electron";

import { installWindowChrome } from "./preloadChrome";
import type { DesktopCommand, DesktopMenuState } from "./desktopCommands";
import type { DesktopAppearance } from './appearance';
import type { FilePickerRequest, FilePickerResult } from './filePicker';
import type { NotificationPreferences, SystemNotification } from '../../../ui/shared/notifications';

installWindowChrome(process.platform, ipcRenderer);

type RuntimeStatus = {
  phase: string;
  message: string;
  logPath?: string;
  error?: string;
  progress?: number;
  startedAt?: number;
  phaseStartedAt?: number;
};

contextBridge.exposeInMainWorld("eastyundeskDesktop", {
  platform: process.platform,
  reconcileSystemNotifications: (value: { scope: string; ids: string[] }) => ipcRenderer.invoke('eastyundesk:notification-reconcile', value),
  dismissSystemNotification: (value: { scope: string; id: string }) => ipcRenderer.invoke('eastyundesk:notification-dismiss', value),
  onSystemNotificationDismiss: (callback: (value: { scope: string; id: string }) => void) => {
    const listener = (_event: IpcRendererEvent, value: { scope: string; id: string }) => callback(value);
    ipcRenderer.on('eastyundesk:notification-dismissed', listener);
    return () => ipcRenderer.off('eastyundesk:notification-dismissed', listener);
  },
  getUninstallStatus: () => ipcRenderer.invoke('eastyundesk:uninstall-status') as Promise<{ supported: boolean }>,
  uninstall: () => ipcRenderer.invoke('eastyundesk:uninstall') as Promise<{ canceled: boolean }>,
  getNotificationStatus: () => ipcRenderer.invoke('eastyundesk:notification-status'),
  setNotificationPreferences: (value: NotificationPreferences) => ipcRenderer.invoke('eastyundesk:notification-preferences', value),
  showNotification: (value: SystemNotification) => ipcRenderer.invoke('eastyundesk:notification-show', value),
  recordTaskReminder: (value: SystemNotification) => ipcRenderer.invoke('eastyundesk:notification-reminder', value),
  setNotificationScope: (scope: string | null) => ipcRenderer.invoke('eastyundesk:notification-scope', scope),
  openNotificationSettings: () => ipcRenderer.invoke('eastyundesk:notification-settings'),
  onNotificationNavigate: (callback: (data: SystemNotification['data']) => void) => {
    const listener = (_event: IpcRendererEvent, data: SystemNotification['data']) => callback(data);
    ipcRenderer.on('eastyundesk:notification-navigate', listener);
    return () => ipcRenderer.off('eastyundesk:notification-navigate', listener);
  },
  // Zoom roles in the application menu drive these; the renderer polls the
  // factor on window resize to show transient feedback (webFrame has no events).
  getZoomFactor: () => webFrame.getZoomFactor(),
  resetZoom: () => {
    webFrame.setZoomLevel(0);
  },
  setMenuState: (state: DesktopMenuState) => ipcRenderer.invoke("eastyundesk:menu-state", state),
  onCommand: (callback: (command: DesktopCommand) => void) => {
    const listener = (_event: IpcRendererEvent, command: DesktopCommand) => callback(command);
    ipcRenderer.on("eastyundesk:command", listener);
    return () => ipcRenderer.off("eastyundesk:command", listener);
  },
  getAppearance: () => ipcRenderer.sendSync("eastyundesk:get-appearance") as DesktopAppearance | null,
  getAppearanceCapabilities: () => ipcRenderer.invoke('eastyundesk:appearance-capabilities') as Promise<{ hardwareAcceleration: boolean }>,
  setAppearance: (value: Partial<DesktopAppearance>) => ipcRenderer.invoke("eastyundesk:set-appearance", value),
  saveAppearanceImage: (bytes: Uint8Array) => ipcRenderer.invoke('eastyundesk:save-appearance-image', bytes),
  readAppearanceImage: (id: string) => ipcRenderer.invoke('eastyundesk:read-appearance-image', id),
  deleteAppearanceImage: (id: string) => ipcRenderer.invoke('eastyundesk:delete-appearance-image', id),
  checkUpdates: () => ipcRenderer.invoke("eastyundesk:update-check"),
  getUpdateStatus: () => ipcRenderer.invoke("eastyundesk:update-status"),
  startUpdate: () => ipcRenderer.invoke("eastyundesk:update-start"),
  cancelUpdate: () => ipcRenderer.invoke("eastyundesk:update-cancel"),
  pauseUpdate: () => ipcRenderer.invoke("eastyundesk:update-pause"),
  resumeUpdate: () => ipcRenderer.invoke("eastyundesk:update-resume"),
  getRuntimeInfo: () => ipcRenderer.invoke("eastyundesk:get-runtime-info"),
  getRuntimeStatus: () => ipcRenderer.sendSync('eastyundesk:get-runtime-status') as RuntimeStatus | null,
  saveRuntimeLogs: () => ipcRenderer.invoke('eastyundesk:save-runtime-logs') as Promise<{ canceled: boolean }>,
  getAboutInfo: () => ipcRenderer.invoke("eastyundesk:about-info"),
  onRuntimeStatus: (callback: (status: RuntimeStatus) => void) => {
    const listener = (_event: IpcRendererEvent, status: RuntimeStatus) => callback(status);
    ipcRenderer.on("eastyundesk:runtime-status", listener);
    return () => ipcRenderer.off("eastyundesk:runtime-status", listener);
  },
  retryRuntime: () => ipcRenderer.invoke("eastyundesk:retry-runtime"),
  openRuntimeLog: () => ipcRenderer.invoke("eastyundesk:open-runtime-log"),
  pickFolder: () => ipcRenderer.invoke("eastyundesk:pick-folder"),
  openDirectory: (directory: string) => ipcRenderer.invoke('eastyundesk:open-directory', directory) as Promise<boolean>,
  pickFiles: (request: FilePickerRequest) => ipcRenderer.invoke('eastyundesk:pick-files', request) as Promise<FilePickerResult>,
});

import { existsSync, watch, type FSWatcher } from "node:fs";
import { dirname } from "node:path";
import { classifyConfigChanges, diffConfigSnapshots } from "./classifyChanges.js";
import { loadEastYunConfig, resolveEastYunConfigPath } from "./loadEastYunConfig.js";
import {
  EastYunConfigError,
  type EastYunConfigDiagnostic,
  type EastYunConfigLoadOptions,
  type EastYunConfigReloadEvent,
  type EastYunConfigSnapshot,
} from "./types.js";

export type EastYunConfigListener = (event: EastYunConfigReloadEvent) => void;

export type EastYunConfigStore = {
  getSnapshot(): EastYunConfigSnapshot;
  getDiagnostics(): EastYunConfigDiagnostic[];
  reload(reason?: string): Promise<EastYunConfigSnapshot>;
  subscribe(listener: EastYunConfigListener): () => void;
  startWatching(options?: { debounceMs?: number }): () => void;
};

export async function createEastYunConfigStore(
  options: EastYunConfigLoadOptions = {},
): Promise<EastYunConfigStore> {
  return createEastYunConfigStoreSync(options);
}

export function createEastYunConfigStoreSync(
  options: EastYunConfigLoadOptions = {},
): EastYunConfigStore {
  const initialSnapshot = loadEastYunConfig(options);
  return new DefaultEastYunConfigStore(initialSnapshot, options);
}

class DefaultEastYunConfigStore implements EastYunConfigStore {
  private currentSnapshot: EastYunConfigSnapshot;
  private lastReloadDiagnostics: EastYunConfigDiagnostic[] = [];
  private readonly listeners = new Set<EastYunConfigListener>();
  private reloading: Promise<EastYunConfigSnapshot> | undefined;
  private nextVersion: number;

  constructor(
    initialSnapshot: EastYunConfigSnapshot,
    private readonly options: EastYunConfigLoadOptions,
  ) {
    this.currentSnapshot = initialSnapshot;
    this.nextVersion = initialSnapshot.version + 1;
  }

  getSnapshot(): EastYunConfigSnapshot {
    return this.currentSnapshot;
  }

  getDiagnostics(): EastYunConfigDiagnostic[] {
    return [...this.currentSnapshot.diagnostics, ...this.lastReloadDiagnostics];
  }

  async reload(_reason = "manual"): Promise<EastYunConfigSnapshot> {
    if (this.reloading) {
      return this.reloading;
    }

    this.reloading = Promise.resolve()
      .then(() => {
        const previousSnapshot = this.currentSnapshot;
        const nextSnapshot = loadEastYunConfig({
          ...this.options,
          version: this.nextVersion,
        });
        const changedPaths = diffConfigSnapshots(previousSnapshot, nextSnapshot);
        const changeClasses = classifyConfigChanges(changedPaths);

        this.currentSnapshot = nextSnapshot;
        this.nextVersion = nextSnapshot.version + 1;
        this.lastReloadDiagnostics = [];
        this.publish({
          previousSnapshot,
          nextSnapshot,
          changedPaths,
          changeClasses,
        });

        return nextSnapshot;
      })
      .catch((error: unknown) => {
        if (error instanceof EastYunConfigError) {
          this.lastReloadDiagnostics = error.diagnostics;
        }
        throw error;
      })
      .finally(() => {
        this.reloading = undefined;
      });

    return this.reloading;
  }

  subscribe(listener: EastYunConfigListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  startWatching(options: { debounceMs?: number } = {}): () => void {
    const debounceMs = options.debounceMs ?? 250;
    const watchers: FSWatcher[] = [];
    let timer: NodeJS.Timeout | undefined;

    const scheduleReload = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        void this.reload("watch").catch(() => {
          // Reload diagnostics are retained on the store; watchers must not crash the runtime.
        });
      }, debounceMs);
    };

    for (const path of this.getWatchedPaths()) {
      const watchedPath = existsSync(path) ? path : dirname(path);
      try {
        watchers.push(watch(watchedPath, scheduleReload));
      } catch {
        // Watcher support is best effort. Manual reload remains available.
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      for (const watcher of watchers) {
        watcher.close();
      }
    };
  }

  private publish(event: EastYunConfigReloadEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Subscribers cannot block or break snapshot publication.
      }
    }
  }

  private getWatchedPaths(): string[] {
    return [resolveEastYunConfigPath(this.options)];
  }
}

import path from 'path';
import { resolveEastYunHome, resolveProjectStorageId } from '../utils/eastyunPaths.js';

export function getAlwaysOnRoot(projectRoot) {
  const eastyunHome = resolveEastYunHome();
  const projectId = resolveProjectStorageId(path.resolve(projectRoot), eastyunHome);
  return path.join(eastyunHome, 'always-on', 'projects', projectId);
}

export function getAlwaysOnDiscoveryLockPath(projectRoot) {
  return path.join(getAlwaysOnRoot(projectRoot), 'locks', 'discovery.lock');
}

export function getAlwaysOnDiscoveryStatePath(projectRoot) {
  return path.join(getAlwaysOnRoot(projectRoot), 'state.json');
}

export function getAlwaysOnRunHistoryPath(projectRoot) {
  return path.join(getAlwaysOnRoot(projectRoot), 'run-history.jsonl');
}

export function getAlwaysOnRunsDir(projectRoot) {
  return path.join(getAlwaysOnRoot(projectRoot), 'runs');
}

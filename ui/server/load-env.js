import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  applyConfigToProcessEnv,
  getEastYunDeskConfigPath,
  readEastYunDeskConfigFile,
} from './services/eastyundeskConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../..');

// EDGECLAW_API_BASE_URL / EDGECLAW_API_KEY / EDGECLAW_MODEL used to be
// required here, but no code in ui/ actually consumes those variables —
// chat execution goes through eastyundesk-bridge.js → src/gateway, which
// reads ~/.eastyundesk/eastyundesk.yaml directly. The sanity check has been
// retired; ui/server boots even when the config file is missing.

function applyDerivedRuntimeEnv() {
  const { config } = readEastYunDeskConfigFile();
  applyConfigToProcessEnv(config);
}

export function getRepoRootDir() {
  return REPO_ROOT;
}

export function getEastYunDeskConfigFilePath() {
  return getEastYunDeskConfigPath();
}

export function hasEastYunDeskConfigFile() {
  return fs.existsSync(getEastYunDeskConfigPath());
}

// Stub for the deprecated boot-time sanity check. Kept as a named export
// so existing callers (e.g. ui/server/index.js) don't need a coordinated
// removal; the function is now a no-op that returns the empty list of
// missing keys.
export function assertRequiredEastYunDeskEnv() {
  return [];
}

export function loadRootEastYunDeskEnv() {
  applyDerivedRuntimeEnv();

  if (!process.env.DATABASE_PATH) {
    process.env.DATABASE_PATH = path.join(process.env.EASTYUN_HOME || path.join(os.homedir(), '.eastyundesk'), 'auth.db');
  }

  return hasEastYunDeskConfigFile();
}

loadRootEastYunDeskEnv();

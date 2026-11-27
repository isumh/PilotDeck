import path from 'node:path';
import os from 'node:os';

export function computerUseDirectory(env = process.env) {
  if (env.EASTYUNDESK_COMPUTER_USE_DIRECTORY) return path.resolve(env.EASTYUNDESK_COMPUTER_USE_DIRECTORY);
  return path.join(path.resolve(env.EASTYUN_HOME || path.join(os.homedir(), '.eastyundesk')), 'computer-use');
}

export function computerUseMcpConfigPath(env = process.env) {
  return env.EASTYUNDESK_COMPUTER_USE_MCP_CONFIG || path.join(computerUseDirectory(env), 'mcp.json');
}

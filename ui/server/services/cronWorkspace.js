import path from 'node:path';
import { resolveCronWorkspacePath } from '../../../src/cron/runtime/CronWorkspace.js';
import { resolveEastYunHome } from '../utils/eastyunPaths.js';
import { ensureGeneralWorkspaceDirectory } from '../utils/generalWorkspace.js';
import { resolveRegisteredProject } from './projectRegistration.js';

export function currentCronWorkspace(task, eastyunHome = resolveEastYunHome(process.env)) {
    return resolveCronWorkspacePath(task, path.resolve(eastyunHome, 'cron', 'worktrees'));
}

/** File requests resolve the current destination without preparing or running a task. */
export function createCronWorkspaceResolver({ getGateway, env = process.env }) {
    return async taskId => {
        const gateway = await getGateway();
        const { tasks } = await gateway.cronList({ taskId });
        const task = tasks.find(item => item.taskId === taskId);
        if (!task) return null;
        const eastyunHome = resolveEastYunHome(env);
        const sourceRoot = path.resolve(task.projectKey) === path.resolve(eastyunHome)
            // General settings affect new tasks; existing tasks retain their saved execution root.
            ? task.workspaceCwd || await ensureGeneralWorkspaceDirectory(env)
            : await resolveRegisteredProject(task.projectKey, eastyunHome);
        return { root: currentCronWorkspace({ ...task, workspaceCwd: task.workspaceCwd || sourceRoot }, eastyunHome),
            sourceRoot, worktree: task.workspaceMode === 'worktree' };
    };
}

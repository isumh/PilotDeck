import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { resolveRegisteredProject } from '../services/projectRegistration.js';
import { isPathInsideOrEqual } from '../utils/pathSafety.js';
import { isVirtualProjectPath, resolveEastYunHome } from '../utils/eastyunPaths.js';

export function createProjectFilesystemMiddleware({ env = process.env, resolveTaskWorkspace } = {}) {
    return async (req, res, next) => {
        try {
            const eastyunHome = resolveEastYunHome(env);
            // Never authorize a project root using request-derived paths or the
            // presentation cache populated by getProjects().
            const taskId = req.params.projectName?.startsWith('cron-task:') ? req.params.projectName.slice(10) : null;
            let taskWorkspace;
            if (taskId !== null) {
                if (!/^[A-Za-z0-9_-]+$/.test(taskId) || !resolveTaskWorkspace) return res.sendStatus(404);
                taskWorkspace = await resolveTaskWorkspace(taskId);
                if (!taskWorkspace?.root || !taskWorkspace.sourceRoot) return res.sendStatus(404);
            }
            const projectRoot = taskWorkspace?.root || await resolveRegisteredProject(req.params.projectName, eastyunHome);
            const [realProjectRoot, realEastYunHome] = await Promise.all([
                realpath(projectRoot),
                realpath(eastyunHome),
            ]);
            const ownedWorktree = taskWorkspace?.worktree === true
                && path.resolve(projectRoot) === path.resolve(eastyunHome, 'cron', 'worktrees', taskId)
                && realProjectRoot === path.join(realEastYunHome, 'cron', 'worktrees', taskId);
            if (taskWorkspace && !ownedWorktree) {
                const realSourceRoot = await realpath(taskWorkspace.sourceRoot);
                if (!isPathInsideOrEqual(taskWorkspace.sourceRoot, projectRoot)
                    || !isPathInsideOrEqual(realSourceRoot, realProjectRoot)) return res.sendStatus(403);
            }
            if (!ownedWorktree && (
                isVirtualProjectPath(projectRoot, eastyunHome, env)
                || isPathInsideOrEqual(eastyunHome, projectRoot)
                || isPathInsideOrEqual(projectRoot, eastyunHome)
                || isPathInsideOrEqual(realEastYunHome, realProjectRoot)
                || isPathInsideOrEqual(realProjectRoot, realEastYunHome)
            )) {
                return res.status(403).json({
                    error: { code: 'PROJECT_PATH_FORBIDDEN', message: 'Project file operations are unavailable for this path.' },
                });
            }
            if (!(await stat(projectRoot)).isDirectory()) {
                throw Object.assign(new Error('Project not found'), { code: 'PROJECT_NOT_FOUND' });
            }
            req.projectRoot = path.resolve(projectRoot);
            return next();
        } catch (error) {
            if (error.code === 'PROJECT_NOT_FOUND' || error.code === 'ENOENT' || error.code === 'ENOTDIR') {
                return res.status(404).json({ error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } });
            }
            return next(error);
        }
    };
}

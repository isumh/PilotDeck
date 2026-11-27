import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    createCollisionResistantProjectId as createCoreCollisionId,
    createProjectId as createCoreProjectId,
    resolveProjectStorageId as resolveCoreProjectStorageId,
    ensureEastYunProjectGitIgnore as ensureCoreGitIgnore,
} from '../../../src/eastyun/paths.js';
import {
    createCollisionResistantProjectId,
    createProjectId,
    resolveProjectStorageId,
    ensureEastYunProjectGitIgnore,
} from './eastyunPaths.js';
import { getAlwaysOnRoot } from '../services/always-on-paths.js';

describe('UI project storage ID resolution', () => {
    it('repairs internal ignore rules identically to the core without creating metadata during Git browse', () => {
        const root = mkdtempSync(join(tmpdir(), 'eastyun-desk-ui-ignore-'));
        try {
            const uiRoot = join(root, 'ui'), coreRoot = join(root, 'core');
            mkdirSync(uiRoot); mkdirSync(coreRoot);
            ensureEastYunProjectGitIgnore(uiRoot, false);
            expect(existsSync(join(uiRoot, '.eastyundesk'))).toBe(false);
            for (const project of [uiRoot, coreRoot]) {
                mkdirSync(join(project, '.eastyundesk'));
                writeFileSync(join(project, '.eastyundesk', '.gitignore'), '# existing\n*.tmp\n!keep.txt');
            }
            ensureEastYunProjectGitIgnore(uiRoot, false);
            ensureCoreGitIgnore(coreRoot, false);
            const expected = readFileSync(join(coreRoot, '.eastyundesk', '.gitignore'), 'utf8');
            expect(readFileSync(join(uiRoot, '.eastyundesk', '.gitignore'), 'utf8')).toBe(expected);
            ensureEastYunProjectGitIgnore(uiRoot, false);
            expect(readFileSync(join(uiRoot, '.eastyundesk', '.gitignore'), 'utf8')).toBe(expected);
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });
    it('matches the core resolver for colliding non-ASCII workspaces', () => {
        const root = mkdtempSync(join(tmpdir(), 'eastyun-desk-ui-project-id-'));
        try {
            const eastyunHome = join(root, 'eastyun-home');
            const projectA = join(root, 'home', '内部测试');
            const projectB = join(root, 'home', '会议纪要');
            mkdirSync(projectA, { recursive: true });
            mkdirSync(projectB, { recursive: true });

            const legacyId = createProjectId(projectA);
            const collisionId = createCollisionResistantProjectId(projectB);
            expect(createProjectId(projectB)).toBe(legacyId);

            mkdirSync(join(eastyunHome, 'projects', legacyId), { recursive: true });
            writeFileSync(join(eastyunHome, 'projects', legacyId, '.cwd'), projectA, 'utf8');
            mkdirSync(join(eastyunHome, 'projects', collisionId), { recursive: true });
            writeFileSync(join(eastyunHome, 'projects', collisionId, '.cwd'), projectB, 'utf8');

            expect(createProjectId(projectA)).toBe(createCoreProjectId(projectA));
            expect(collisionId).toBe(createCoreCollisionId(projectB));
            expect(resolveProjectStorageId(projectA, eastyunHome)).toBe(legacyId);
            expect(resolveProjectStorageId(projectB, eastyunHome)).toBe(collisionId);
            expect(resolveProjectStorageId(projectA, eastyunHome)).toBe(
                resolveCoreProjectStorageId(projectA, eastyunHome),
            );
            expect(resolveProjectStorageId(projectB, eastyunHome)).toBe(
                resolveCoreProjectStorageId(projectB, eastyunHome),
            );
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('matches core fallback behavior for missing and invalid markers', () => {
        const root = mkdtempSync(join(tmpdir(), 'eastyun-desk-ui-project-id-fallback-'));
        try {
            const eastyunHome = join(root, 'eastyun-home');
            const projectRoot = join(root, 'workspace', 'ascii-project');
            mkdirSync(projectRoot, { recursive: true });

            const invalidId = createCollisionResistantProjectId(projectRoot);
            mkdirSync(join(eastyunHome, 'projects', invalidId), { recursive: true });
            writeFileSync(join(eastyunHome, 'projects', invalidId, '.cwd'), join(root, 'missing'), 'utf8');

            expect(resolveProjectStorageId(projectRoot, eastyunHome)).toBe(createProjectId(projectRoot));
            expect(resolveProjectStorageId(projectRoot, eastyunHome)).toBe(
                resolveCoreProjectStorageId(projectRoot, eastyunHome),
            );
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('uses the resolved storage ID for the UI Always-On root', () => {
        const root = mkdtempSync(join(tmpdir(), 'eastyun-desk-ui-always-on-root-'));
        const previousEastYunHome = process.env.EASTYUN_HOME;
        try {
            const eastyunHome = join(root, 'eastyun-home');
            const projectRoot = join(root, 'home', '会议纪要');
            const projectId = createCollisionResistantProjectId(projectRoot);
            mkdirSync(projectRoot, { recursive: true });
            mkdirSync(join(eastyunHome, 'projects', projectId), { recursive: true });
            writeFileSync(join(eastyunHome, 'projects', projectId, '.cwd'), projectRoot, 'utf8');
            process.env.EASTYUN_HOME = eastyunHome;

            expect(getAlwaysOnRoot(projectRoot)).toBe(
                join(eastyunHome, 'always-on', 'projects', projectId),
            );
        } finally {
            if (previousEastYunHome === undefined) {
                delete process.env.EASTYUN_HOME;
            } else {
                process.env.EASTYUN_HOME = previousEastYunHome;
            }
            rmSync(root, { recursive: true, force: true });
        }
    });
});

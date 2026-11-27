import { useCallback, useRef, useState } from 'react';
import { createWorkspaceRequest } from '../../../project-creation-wizard/data/workspaceApi';
import type { WorkspaceType } from '../../../project-creation-wizard/types';
import type { WorkspaceDraft } from '../types';

/**
 * EastYunDesk onboarding only creates a brand-new local workspace: the
 * clone-from-GitHub flow and its credential prompts were removed from the
 * first-run wizard.
 */
const initialDraft: WorkspaceDraft = {
  workspaceType: 'new',
  workspacePath: '',
};

export default function useOnboardingWorkspace() {
  const [draft, setDraft] = useState<WorkspaceDraft>(initialDraft);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const createdDraftsRef = useRef(new Map<string, Record<string, unknown> | undefined>());
  const inFlightRef = useRef<{
    fingerprint: string;
    promise: Promise<Record<string, unknown> | undefined>;
  } | null>(null);

  const setWorkspaceType = useCallback((workspaceType: WorkspaceType) => {
    setDraft((current) => ({ ...current, workspaceType }));
    setError('');
  }, []);

  const setWorkspacePath = useCallback((workspacePath: string) => {
    setDraft((current) => ({ ...current, workspacePath }));
    setError('');
  }, []);

  const canFinish = draft.workspacePath.trim().length > 0;

  const createWorkspace = useCallback(async () => {
    const workspacePath = draft.workspacePath.trim();
    if (!workspacePath) {
      throw new Error('Workspace path is required.');
    }
    const fingerprint = JSON.stringify({ workspacePath });
    if (createdDraftsRef.current.has(fingerprint)) return createdDraftsRef.current.get(fingerprint);
    if (inFlightRef.current?.fingerprint === fingerprint) {
      return inFlightRef.current.promise;
    }

    setIsCreating(true);
    setError('');
    setProgress('');

    const operation = createWorkspaceRequest({
      workspaceType: 'new',
      path: workspacePath,
    });
    inFlightRef.current = { fingerprint, promise: operation };

    try {
      const result = await operation;
      createdDraftsRef.current.set(fingerprint, result);
      return result;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Failed to create workspace';
      setError(message);
      throw caughtError;
    } finally {
      if (inFlightRef.current?.promise === operation) inFlightRef.current = null;
      setIsCreating(false);
    }
  }, [draft.workspacePath]);

  return {
    draft,
    isCreating,
    error,
    progress,
    canFinish,
    setWorkspaceType,
    setWorkspacePath,
    createWorkspace,
  };
}

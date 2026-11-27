// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useOnboardingWorkspace from './useOnboardingWorkspace';

const mocks = vi.hoisted(() => ({
  createWorkspaceRequest: vi.fn(),
}));

vi.mock('../../../project-creation-wizard/data/workspaceApi', () => ({
  createWorkspaceRequest: mocks.createWorkspaceRequest,
}));

describe('useOnboardingWorkspace retry safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createWorkspaceRequest.mockResolvedValue({ name: 'demo' });
  });

  it('does not create the same workspace again after creation succeeds', async () => {
    const { result } = renderHook(() => useOnboardingWorkspace());
    act(() => result.current.setWorkspacePath('/workspace/demo'));

    let created, retried;
    await act(async () => { created = await result.current.createWorkspace(); });
    await act(async () => { retried = await result.current.createWorkspace(); });

    expect(created).toEqual({ name: 'demo' });
    expect(retried).toBe(created);

    expect(mocks.createWorkspaceRequest).toHaveBeenCalledTimes(1);
    expect(mocks.createWorkspaceRequest).toHaveBeenCalledWith({
      workspaceType: 'new',
      path: '/workspace/demo',
    });
  });

  it('creates again when the workspace draft changes', async () => {
    const { result } = renderHook(() => useOnboardingWorkspace());
    act(() => result.current.setWorkspacePath('/workspace/first'));
    await act(async () => result.current.createWorkspace());

    act(() => result.current.setWorkspacePath('/workspace/second'));
    await act(async () => result.current.createWorkspace());

    expect(mocks.createWorkspaceRequest).toHaveBeenCalledTimes(2);
  });

  it('allows a failed creation to retry instead of caching the failure', async () => {
    mocks.createWorkspaceRequest.mockRejectedValueOnce(new Error('Workspace unavailable'));
    const { result } = renderHook(() => useOnboardingWorkspace());
    act(() => result.current.setWorkspacePath('/workspace/demo'));
    await act(async () => {
      await expect(result.current.createWorkspace()).rejects.toThrow('Workspace unavailable');
    });
    await act(async () => {
      expect(await result.current.createWorkspace()).toEqual({ name: 'demo' });
    });
    expect(mocks.createWorkspaceRequest).toHaveBeenCalledTimes(2);
  });

  it('always creates a new local workspace without a clone request', async () => {
    const { result } = renderHook(() => useOnboardingWorkspace());
    act(() => result.current.setWorkspacePath('/workspace/local'));

    await act(async () => result.current.createWorkspace());

    expect(mocks.createWorkspaceRequest).toHaveBeenCalledWith({
      workspaceType: 'new',
      path: '/workspace/local',
    });
    expect(result.current.draft).toEqual({
      workspaceType: 'new',
      workspacePath: '/workspace/local',
    });
  });
});

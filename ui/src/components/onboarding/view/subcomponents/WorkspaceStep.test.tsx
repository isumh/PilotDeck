// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WorkspaceStep, { type WorkspaceStepProps } from './WorkspaceStep';

vi.mock('react-i18next', async () => {
  const enOnboarding = (await import('../../../../i18n/locales/en/onboarding.json')).default as Record<string, unknown>;
  const lookupTranslation = (key: string) => {
    const value = key.split('.').reduce<unknown>(
      (current, segment) => (current && typeof current === 'object' ? (current as Record<string, unknown>)[segment] : undefined),
      enOnboarding,
    );
    return typeof value === 'string' ? value : key;
  };

  return {
    useTranslation: () => ({
      t: (key: string) => {
        if (key === 'buttons.cancel') return 'Cancel';
        if (key === 'buttons.close') return 'Close';
        return lookupTranslation(key);
      },
      i18n: { language: 'en', changeLanguage: vi.fn() },
    }),
  };
});

vi.mock('../../../project-creation-wizard/components/FolderBrowserModal', () => ({
  default: ({ isOpen, onFolderSelected }: { isOpen: boolean; onFolderSelected: (path: string) => void }) => (
    isOpen ? <button onClick={() => onFolderSelected('/tmp/from-browser')}>Use test folder</button> : null
  ),
}));

const draft = {
  workspaceType: 'new' as const,
  workspacePath: '',
};

type OnboardingWorkspaceStepProps = Extract<WorkspaceStepProps, { variant?: 'onboarding' }>;

function renderStep(overrides: Partial<Omit<OnboardingWorkspaceStepProps, 'variant' | 'onCancel'>> = {}) {
  const onFinish = vi.fn();
  const onSkipChat = vi.fn();
  render(
    <WorkspaceStep
      draft={draft}
      error=""
      progress=""
      isCreating={false}
      onWorkspacePathChange={vi.fn()}
      onBack={vi.fn()}
      onSkipChat={onSkipChat}
      onFinish={onFinish}
      {...overrides}
    />,
  );
  return { onFinish, onSkipChat };
}

describe('WorkspaceStep', () => {
  afterEach(() => {
    cleanup();
    delete window.eastyundeskDesktop;
  });

  it('lets Start chatting skip workspace validation', () => {
    const { onFinish, onSkipChat } = renderStep();

    fireEvent.click(screen.getByRole('button', { name: 'Start chatting' }));

    expect(onSkipChat).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.queryByText('Enter a workspace path.')).toBeNull();
  });

  it('requires Workspace only when creating a workspace', () => {
    const { onFinish } = renderStep();

    fireEvent.click(screen.getByRole('button', { name: /Create workspace/ }));

    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a workspace path.')).toBeTruthy();
  });

  it('creates the workspace once a path is provided', () => {
    const { onFinish } = renderStep({
      draft: { ...draft, workspacePath: '/tmp/eastyundesk' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create workspace/ }));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('dialog variant keeps the workspace form and hides onboarding skip actions', () => {
    const onCancel = vi.fn();
    render(
      <WorkspaceStep
        variant="dialog"
        draft={draft}
        error=""
        progress=""
        isCreating={false}
        onWorkspacePathChange={vi.fn()}
        onCancel={onCancel}
        onFinish={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Start chatting' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(screen.getByRole('button', { name: /Create workspace/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses the in-app folder browser on the web', async () => {
    const onWorkspacePathChange = vi.fn();

    renderStep({ onWorkspacePathChange });
    fireEvent.click(screen.getByRole('button', { name: 'Choose file' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Use test folder' }));

    await waitFor(() => {
      expect(onWorkspacePathChange).toHaveBeenCalledWith('/tmp/from-browser');
    });
  });

  it('uses the shared folder browser in the desktop app', async () => {
    const onWorkspacePathChange = vi.fn();
    const pickFolder = vi.fn(async () => '/tmp/from-desktop');
    window.eastyundeskDesktop = { pickFolder } as never;
    renderStep({ onWorkspacePathChange });
    fireEvent.click(screen.getByRole('button', { name: 'Choose file' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Use test folder' }));
    expect(onWorkspacePathChange).toHaveBeenCalledWith('/tmp/from-browser');
    expect(pickFolder).not.toHaveBeenCalled();
  });
});

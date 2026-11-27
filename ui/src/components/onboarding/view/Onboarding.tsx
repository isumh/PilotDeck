import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../../../utils/api';
import {
  BUILTIN_PROVIDER,
  CONFIGURED_ONBOARDING_STEP_IDS,
  ONBOARDING_STEP_IDS,
  type OnboardingStepId,
} from './constants';
import useLlmSetup from './hooks/useLlmSetup';
import useOnboardingWorkspace from './hooks/useOnboardingWorkspace';
import ConnectionStep from './subcomponents/ConnectionStep';
import LanguageStep from './subcomponents/LanguageStep';
import SetupSidebar from './subcomponents/SetupSidebar';
import WorkspaceStep from './subcomponents/WorkspaceStep';
import './Onboarding.css';

type OnboardingProps = {
  onComplete?: () => void | Promise<void>;
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>('language');
  const [completeError, setCompleteError] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const finishingRef = useRef(false);
  // The builtin provider is fixed, so the wizard never shows a provider picker.
  const llm = useLlmSetup({ initialProvider: BUILTIN_PROVIDER });
  const workspace = useOnboardingWorkspace();

  // A usable key is already stored: the connection step has nothing to collect,
  // so the wizard collapses to language → workspace.
  const steps: readonly OnboardingStepId[] = useMemo(
    () => (llm.hasStoredApiKey ? CONFIGURED_ONBOARDING_STEP_IDS : ONBOARDING_STEP_IDS),
    [llm.hasStoredApiKey],
  );

  const goTo = useCallback((step: OnboardingStepId) => {
    setCompleteError('');
    setCurrentStep(step);
  }, []);

  const goBack = useCallback(() => {
    const index = steps.indexOf(currentStep);
    if (index > 0) {
      goTo(steps[index - 1]);
    }
  }, [currentStep, goTo, steps]);

  const goNext = useCallback(() => {
    const index = steps.indexOf(currentStep);
    if (index >= 0 && index < steps.length - 1) {
      goTo(steps[index + 1]);
    }
  }, [currentStep, goTo, steps]);

  const handleConnectionContinue = useCallback(async () => {
    if (!llm.connectionTestPassed) {
      setCompleteError('Run a successful connection test before continuing.');
      return;
    }
    setCompleteError('');
    try {
      await llm.handleSave();
      goNext();
    } catch {
      /* error is surfaced by the connection form */
    }
  }, [goNext, llm]);

  const handleFinish = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setIsFinishing(true);
    setCompleteError('');
    try {
      const project = await workspace.createWorkspace();
      const response = await authenticatedFetch('/api/user/complete-onboarding', { method: 'POST' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to complete onboarding');
      }
      // Refreshing the auth gate can unmount onboarding immediately. Set the
      // destination first so the shell resolves this workspace on its first render.
      if (typeof project?.name === 'string' && project.name) {
        navigate(`/p/${encodeURIComponent(project.name)}`, { replace: true });
      }
      await onComplete?.();
    } catch (caughtError) {
      setCompleteError(caughtError instanceof Error ? caughtError.message : 'Failed to complete onboarding');
    } finally {
      finishingRef.current = false;
      setIsFinishing(false);
    }
  }, [navigate, onComplete, workspace]);

  const handleSkipChat = useCallback(async () => {
    setCompleteError('');
    try {
      const response = await authenticatedFetch('/api/user/complete-onboarding', { method: 'POST' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to complete onboarding');
      }
      await onComplete?.();
    } catch (caughtError) {
      setCompleteError(caughtError instanceof Error ? caughtError.message : 'Failed to complete onboarding');
    }
  }, [onComplete]);

  return (
    <main className="onboarding-shell prototype-shell desktop-prototype-shell" data-platform="desktop">
      <section className="onboarding-frame" aria-live="polite">
        <SetupSidebar currentStep={currentStep} steps={steps} />
        <div className="setup-content">
          {currentStep === 'language' && (
            <LanguageStep onContinue={goNext} />
          )}
          {currentStep === 'connection' && (
            <ConnectionStep
              llm={llm}
              onBack={goBack}
              onContinue={handleConnectionContinue}
              requirePassedTest
            />
          )}
          {currentStep === 'workspace' && (
            <WorkspaceStep
              draft={workspace.draft}
              error={completeError || workspace.error}
              progress={workspace.progress}
              isCreating={isFinishing || workspace.isCreating}
              onWorkspacePathChange={workspace.setWorkspacePath}
              onBack={goBack}
              onSkipChat={handleSkipChat}
              onFinish={handleFinish}
            />
          )}
        </div>
      </section>
    </main>
  );
}

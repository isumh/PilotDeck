import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useEastYunDeskConfig } from "../../../../hooks/useEastYunDeskConfig";
import { ConfigSaveError } from "../../shared/view";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { EastYunDeskConfig } from "../modelPool/types";
import AdvancedRetrySection from "./components/AdvancedRetrySection";
import ServiceSection from "./components/ServiceSection";
import CustomEnvSection from "./components/CustomEnvSection";
import RuntimeLogsSection from './components/RuntimeLogsSection';
import PythonRuntimeSection from './components/PythonRuntimeSection';
import GitRuntimeSection from './components/GitRuntimeSection';

type AdvancedSectionsProps = {
  title: string;
};

export default function AdvancedSections({ title: _title }: AdvancedSectionsProps) {
  const { t } = useTranslation("settings");
  const {
    path,
    raw,
    commitRaw,
    loading,
    saving,
    error,
  } = useEastYunDeskConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const saveConfig = async (next: EastYunDeskConfig) => {
    try {
      const result = await commitRaw(configToYamlString(next));
      return result.ok;
    } catch (caught) {
      console.error("Failed to serialise advanced config patch", caught);
      return false;
    }
  };

  return (
    <div className="advanced-page-content">
      <ConfigSaveError error={error} />
      {loading ? (
        <div className="py-6 text-xs text-muted-foreground">
          {t("eastyunDeskConfig.loading")}
        </div>
      ) : parsedConfig ? (
        <>
          <PythonRuntimeSection config={parsedConfig} onSave={saveConfig} saving={saving} />
          <GitRuntimeSection />
          <RuntimeLogsSection config={parsedConfig} onSave={saveConfig} saving={saving} />
          <AdvancedRetrySection
            config={parsedConfig}
            onSave={saveConfig}
            saving={saving}
          />
          <ServiceSection
            config={parsedConfig}
            onSave={saveConfig}
            saving={saving}
          />
          <CustomEnvSection
            config={parsedConfig}
            onSave={saveConfig}
            saving={saving}
          />
        </>
      ) : (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-[var(--pd-danger-ink)]">
          {t("settingsPage.invalidYaml.advanced")}
        </div>
      )}

      {!loading && path ? (
        <p className="advanced-config-file-note">
          {t("eastyunDeskConfig.panels.advancedPage.configFilePrefix")}{" "}
          <code>{path}</code>
          {t("eastyunDeskConfig.panels.advancedPage.configFileSuffix")}
        </p>
      ) : null}
    </div>
  );
}

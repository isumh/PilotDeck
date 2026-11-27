import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AboutSections from ".";
import type { DesktopVersionCheckResult } from "../../version";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

afterEach(() => cleanup());

describe("Web About page", () => {
  const versionInfo: DesktopVersionCheckResult = {
    mode: "web",
    hasUpdate: false,
    checkUnavailable: false,
    currentVersion: "v2026.09.23",
    latestVersion: null,
    latestPublishedAt: null,
    buildTime: null,
  };

  it("shows the local version and the EastYunDesk release link without an update action", () => {
    render(<AboutSections title="About" versionInfo={versionInfo} checkingVersion={false} />);
    expect(screen.getByText("v2026.09.23")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("https://www.ceairyn.com");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("falls back to 1.0 when the build version is unknown", () => {
    render(
      <AboutSections
        title="About"
        versionInfo={{ ...versionInfo, currentVersion: "unknown" }}
        checkingVersion={false}
      />,
    );
    expect(screen.getByText("1.0")).toBeTruthy();
  });
});

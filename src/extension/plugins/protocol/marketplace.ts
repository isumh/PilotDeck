import type { EastYunDeskMarketplaceReference } from "./manifest.js";

export type EastYunDeskPluginMarketplaceStatus = "resolved" | "deferred";

export type EastYunDeskMarketplaceResolution = {
  status: EastYunDeskPluginMarketplaceStatus;
  reference: EastYunDeskMarketplaceReference;
  reason?: string;
};

export function resolveMarketplaceReference(reference: EastYunDeskMarketplaceReference): EastYunDeskMarketplaceResolution {
  if (reference.source === "git" || reference.source === "zip" || reference.source === "mcpb") {
    return {
      status: "deferred",
      reference,
      reason: `${reference.source} installation is not implemented in the local runtime.`,
    };
  }
  return { status: "resolved", reference };
}

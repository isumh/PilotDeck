export type EastYunDeskPermissionHookDecision =
  | {
      behavior: "allow";
      updatedInput?: Record<string, unknown>;
      updatedPermissions?: unknown[];
    }
  | {
      behavior: "deny";
      message?: string;
      interrupt?: boolean;
    };

export type EastYunDeskHookSpecificOutput = {
  hookEventName: string;
  additionalContext?: string;
  initialUserMessage?: string;
  watchPaths?: string[];
  permissionDecision?: "allow" | "deny" | "ask" | "passthrough";
  permissionDecisionReason?: string;
  updatedInput?: Record<string, unknown>;
  updatedMCPToolOutput?: unknown;
  decision?: EastYunDeskPermissionHookDecision;
  retry?: boolean;
  worktreePath?: string;
};

export type EastYunDeskHookSyncOutput = {
  type: "sync";
  continue?: boolean;
  suppressOutput?: boolean;
  stopReason?: string;
  decision?: "approve" | "block";
  reason?: string;
  systemMessage?: string;
  specific?: EastYunDeskHookSpecificOutput;
  raw?: unknown;
};

export type EastYunDeskHookAsyncOutput = {
  type: "async";
  raw?: unknown;
};

export type EastYunDeskHookOutput = EastYunDeskHookSyncOutput | EastYunDeskHookAsyncOutput;

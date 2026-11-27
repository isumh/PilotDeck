export type EastYunDeskToolInputSchema = {
  type: "object";
  properties?: Record<string, EastYunDeskJsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
};

export type EastYunDeskJsonSchema = {
  type?: string | string[];
  properties?: Record<string, EastYunDeskJsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: EastYunDeskJsonSchema;
  enum?: unknown[];
  [key: string]: unknown;
};

export type EastYunDeskToolValidationIssue = {
  path: string;
  code: "required" | "unknown_property" | "invalid_type" | "invalid_enum" | "invalid_schema";
  message: string;
};

export type EastYunDeskToolValidationResult =
  | { ok: true; input: unknown }
  | { ok: false; issues: EastYunDeskToolValidationIssue[] };

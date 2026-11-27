/**
 * Builtin skills shipped by upstream but not exposed in EastYunDesk.
 *
 * The directories stay in `skills/` so nothing is lost on sync: hiding is a
 * read-time filter only, and deleting one entry here restores the skill.
 */
export const HIDDEN_BUILTIN_SKILLS: ReadonlySet<string> = new Set([
  "1password",
  "apple-notes",
  "apple-reminders",
  "bear-notes",
  "blogwatcher",
  "github",
  "gog",
  "himalaya",
  "notion",
  "obsidian",
  "tmux",
  "trello",
]);

/** True when the slug is a hidden builtin skill. Only `builtin` scope is affected. */
export function isHiddenBuiltinSkill(slug: string): boolean {
  return HIDDEN_BUILTIN_SKILLS.has(slug);
}

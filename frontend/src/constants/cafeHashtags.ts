/**
 * Hashtag ids used in filter `tags` query (comma-separated). Must match
 * backend cafe enum and seed data when BE is merged.
 */
export const CAFE_HASHTAG_IDS = [
  "wifi",
  "outlets",
  "quiet",
  "japanese",
  "noTimeLimit",
] as const;

export type CafeHashtagId = (typeof CAFE_HASHTAG_IDS)[number];

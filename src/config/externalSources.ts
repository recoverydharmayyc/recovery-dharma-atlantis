export const GLOBAL_DIRECTORY_SOURCE = {
  name: "Recovery Dharma Global",
  endpoint: "https://recoverydharma.org/wp-admin/admin-ajax.php?action=meetings",
  directoryUrl: "https://recoverydharma.org/meetings/",
  requestTimeoutMs: 8_000,
  cacheKey: "recovery-dharma-atlantis-global-meetings-v2",
  cacheSchemaVersion: 2,
  cacheMaxAgeMs: 15 * 60 * 1_000,
  maxResponseRecords: 2_000,
  maxCachedRecords: 240,
  previewLimit: 6,
} as const;

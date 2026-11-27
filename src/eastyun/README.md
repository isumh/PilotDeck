# Configuration and paths

Resolves EastYunDesk paths and loads, validates and updates application configuration.

Entry points: [paths.ts](paths.ts), [loadEastYunConfig.ts](config/loadEastYunConfig.ts), [EastYunConfigStore.ts](config/EastYunConfigStore.ts).

Preserve unknown configuration fields, masked secrets and concurrent-write checks. General workspace registration must protect existing files and directory identity.

Tests: [tests/eastyun](../../tests/eastyun). See the [test guide](../../docs/testing.md) for runner selection.

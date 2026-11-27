---
name: browser-use-install
description: Use before browser-use, Playwright MCP, web browsing, browser automation, or when browser-use fails with a missing browser, missing executable, "Executable doesn't exist", or Chrome/Chromium install error in EastYunDesk Desktop.
---

# Browser-Use Install

EastYunDesk Desktop ships browser-use without a bundled Chrome browser. When browser automation is needed, install the Playwright Chrome for Testing browser into the user's writable EastYunDesk data directory, then retry the browser-use tool.

## Install

Run this from any working directory:

```bash
node "$EASTYUNDESK_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

In PowerShell, use:

```powershell
node "$env:EASTYUNDESK_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

If `EASTYUNDESK_RUNTIME_ROOT` is not set, find the EastYunDesk runtime root first. It is the directory that contains `node_modules/@playwright/mcp/cli.js` and `dist/src/cli/eastyundesk.js`, then run:

```bash
EASTYUNDESK_RUNTIME_ROOT="/path/to/runtime" node "/path/to/runtime/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

PowerShell equivalent:

```powershell
$env:EASTYUNDESK_RUNTIME_ROOT = 'C:\Path\To\EastYunDesk\resources\runtime'
node "$env:EASTYUNDESK_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

## Mirrors And Offline

Use the same environment variables as desktop packaging when the default network is blocked:

```bash
EASTYUNDESK_DESKTOP_DOWNLOAD_MIRROR=china node "$EASTYUNDESK_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

For fully offline installs, point to a directory containing the matching `chrome-*.zip` archive:

```bash
EASTYUNDESK_DESKTOP_PLAYWRIGHT_ARCHIVE_DIR="/path/to/playwright-archives" node "$EASTYUNDESK_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

## After Install

Retry the browser-use request after the install succeeds. If the current MCP session still reports the old missing-browser error, tell the user to send the same request once more so EastYunDesk can start a fresh browser-use session.

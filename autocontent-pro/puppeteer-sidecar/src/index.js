#!/usr/bin/env node
/**
 * Puppeteer Sidecar — stdin/stdout JSON IPC for Tauri
 * Handles: cookie capture, cookie validation, browser session management
 * Protocol: newline-delimited JSON on stdin, JSON responses on stdout
 */

const readline = require('readline');
const { launchAndCaptureCookies, validateCookies } = require('./cookie-capture-handler.js');
const { getStealthConfig } = require('./stealth-config-handler.js');

let activeBrowser = null;

const rl = readline.createInterface({ input: process.stdin, terminal: false });

function respond(data) {
  process.stdout.write(JSON.stringify(data) + '\n');
}

rl.on('line', async (line) => {
  let cmd;
  try {
    cmd = JSON.parse(line.trim());
  } catch {
    respond({ success: false, error: 'Invalid JSON command' });
    return;
  }

  try {
    switch (cmd.type) {
      case 'capture-cookies': {
        const result = await launchAndCaptureCookies({
          url: cmd.url || 'https://labs.google/fx/vi/tools/flow',
          chromePath: cmd.chromePath || null,
          headless: cmd.headless || false,
          proxyServer: cmd.proxyServer || null,
          timeout: cmd.timeout || 300000,
        });
        activeBrowser = result.browser;
        respond({ success: true, cookies: result.cookies, url: result.finalUrl });
        break;
      }

      case 'validate-cookies': {
        const valid = await validateCookies({
          cookies: cmd.cookies,
          chromePath: cmd.chromePath || null,
          proxyServer: cmd.proxyServer || null,
        });
        respond({ success: true, valid });
        break;
      }

      case 'get-stealth-config': {
        const config = getStealthConfig();
        respond({ success: true, config });
        break;
      }

      case 'close': {
        if (activeBrowser) {
          await activeBrowser.close().catch(() => {});
          activeBrowser = null;
        }
        respond({ success: true });
        break;
      }

      case 'ping': {
        respond({ success: true, pong: true });
        break;
      }

      default:
        respond({ success: false, error: `Unknown command: ${cmd.type}` });
    }
  } catch (err) {
    respond({ success: false, error: err.message || String(err) });
  }
});

rl.on('close', async () => {
  if (activeBrowser) {
    await activeBrowser.close().catch(() => {});
  }
  process.exit(0);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (activeBrowser) await activeBrowser.close().catch(() => {});
  process.exit(0);
});

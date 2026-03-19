/**
 * Cookie Capture Handler — Interactive Google Flow login + cookie extraction
 * Uses puppeteer-extra with stealth plugin for anti-detection
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getStealthConfig } = require('./stealth-config-handler.js');

puppeteer.use(StealthPlugin());

/**
 * Launch interactive browser for user to login, then capture cookies
 * @param {Object} opts - { url, chromePath, headless, proxyServer, timeout }
 * @returns {{ browser, cookies, finalUrl }}
 */
async function launchAndCaptureCookies(opts) {
  const stealthConfig = getStealthConfig();
  const args = [
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${stealthConfig.viewport.width},${stealthConfig.viewport.height}`,
    '--disable-blink-features=AutomationControlled',
  ];

  if (opts.proxyServer) {
    args.push(`--proxy-server=${opts.proxyServer}`);
  }

  const launchOpts = {
    headless: opts.headless ? 'new' : false,
    args,
    defaultViewport: stealthConfig.viewport,
    ignoreDefaultArgs: ['--enable-automation'],
  };

  if (opts.chromePath) {
    launchOpts.executablePath = opts.chromePath;
  }

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();

  // Set realistic user agent
  const ua = stealthConfig.userAgents[Math.floor(Math.random() * stealthConfig.userAgents.length)];
  await page.setUserAgent(ua);

  // Set extra headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    'sec-ch-ua-platform': '"Windows"',
  });

  // Navigate to Google Flow
  await page.goto(opts.url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for user to login — detect login success by checking for session indicators
  const loginDetected = await waitForLogin(page, opts.timeout);

  if (!loginDetected) {
    await browser.close();
    throw new Error('Login timeout — user did not complete Google login');
  }

  // Extract all cookies from the browser
  const cookies = await page.cookies();
  const finalUrl = page.url();

  // Filter relevant cookies (Google auth)
  const relevantCookies = cookies.filter(c =>
    c.domain.includes('google.com') ||
    c.domain.includes('googleapis.com') ||
    c.domain.includes('labs.google') ||
    c.domain.includes('imagefx')
  );

  return {
    browser,
    cookies: relevantCookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite || 'Lax',
    })),
    finalUrl,
  };
}

/**
 * Wait for Google login to complete by checking URL and cookie presence
 * @param {Page} page
 * @param {number} timeout - ms
 * @returns {boolean}
 */
async function waitForLogin(page, timeout) {
  const startTime = Date.now();
  const checkInterval = 2000;

  while (Date.now() - startTime < timeout) {
    const url = page.url();
    const cookies = await page.cookies();

    // Check for Google auth cookies indicating successful login
    const hasAuthCookies = cookies.some(c =>
      (c.name === 'SID' || c.name === 'HSID' || c.name === 'SSID' ||
       c.name === '__Secure-1PSID' || c.name === '__Secure-3PSID') &&
      c.domain.includes('google.com')
    );

    // Check if redirected away from login page
    const isOnFlow = url.includes('labs.google') || url.includes('imagefx');
    const isNotLogin = !url.includes('accounts.google.com/v3/signin');

    if (hasAuthCookies && isOnFlow && isNotLogin) {
      // Wait a bit for all cookies to settle
      await new Promise(r => setTimeout(r, 2000));
      return true;
    }

    await new Promise(r => setTimeout(r, checkInterval));
  }

  return false;
}

/**
 * Validate existing cookies by loading Google Flow in headless mode
 * @param {Object} opts - { cookies, chromePath, proxyServer }
 * @returns {boolean}
 */
async function validateCookies(opts) {
  const args = ['--no-first-run', '--disable-blink-features=AutomationControlled'];
  if (opts.proxyServer) args.push(`--proxy-server=${opts.proxyServer}`);

  const launchOpts = {
    headless: 'new',
    args,
    defaultViewport: { width: 1280, height: 800 },
  };

  if (opts.chromePath) {
    launchOpts.executablePath = opts.chromePath;
  }

  const browser = await puppeteer.launch(launchOpts);

  try {
    const page = await browser.newPage();

    // Set cookies before navigation
    if (opts.cookies && opts.cookies.length > 0) {
      await page.setCookie(...opts.cookies);
    }

    // Try to access Google Flow
    await page.goto('https://labs.google/fx/vi/tools/flow', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const url = page.url();

    // If redirected to login, cookies are invalid
    const isValid = !url.includes('accounts.google.com') && !url.includes('signin');
    return isValid;
  } finally {
    await browser.close();
  }
}

module.exports = { launchAndCaptureCookies, validateCookies };

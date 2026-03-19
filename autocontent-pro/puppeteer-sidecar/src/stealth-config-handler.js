/**
 * Stealth Config Handler — Browser fingerprint profiles for anti-detection
 * Provides realistic browser characteristics to evade bot detection
 */

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
];

const WEBGL_VENDORS = [
  'Google Inc. (NVIDIA)',
  'Google Inc. (AMD)',
  'Google Inc. (Intel)',
];

const WEBGL_RENDERERS = [
  'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (Intel, Intel(R) UHD Graphics 770 Direct3D11 vs_5_0 ps_5_0)',
];

const SCREEN_RESOLUTIONS = [
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 1680, height: 1050 },
  { width: 1440, height: 900 },
];

/**
 * Generate a randomized stealth config for browser fingerprinting
 */
function getStealthConfig() {
  const screenIdx = Math.floor(Math.random() * SCREEN_RESOLUTIONS.length);
  const glIdx = Math.floor(Math.random() * WEBGL_VENDORS.length);

  return {
    userAgents: USER_AGENTS,
    viewport: SCREEN_RESOLUTIONS[screenIdx],
    webgl: {
      vendor: WEBGL_VENDORS[glIdx],
      renderer: WEBGL_RENDERERS[glIdx],
    },
    navigator: {
      languages: ['en-US', 'en', 'vi'],
      platform: process.platform === 'darwin' ? 'MacIntel' : 'Win32',
      hardwareConcurrency: [4, 8, 12, 16][Math.floor(Math.random() * 4)],
      deviceMemory: [4, 8, 16][Math.floor(Math.random() * 3)],
      maxTouchPoints: 0,
    },
    canvas: {
      noise: true,
      noiseFactor: 0.0001 + Math.random() * 0.0005,
    },
    audioContext: {
      noise: true,
      noiseFactor: 0.00001 + Math.random() * 0.00005,
    },
    fonts: [
      'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
      'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS',
      'Arial Black', 'Impact', 'Lucida Console', 'Tahoma', 'Segoe UI',
    ],
  };
}

module.exports = { getStealthConfig, USER_AGENTS };

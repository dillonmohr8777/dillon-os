import {Config} from '@remotion/cli/config';

// Pre-installed Playwright Chromium in this environment — avoids any
// browser download at render time.
Config.setBrowserExecutable(
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
);
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(4);
Config.setOverwriteOutput(true);

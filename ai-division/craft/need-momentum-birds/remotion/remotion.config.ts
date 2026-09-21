import {Config} from "@remotion/cli/config";
import {existsSync} from "fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(1);
const chromePath = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  "/usr/bin/google-chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].find((path): path is string => Boolean(path && existsSync(path)));

if (chromePath) Config.setBrowserExecutable(chromePath);
Config.setChromiumOpenGlRenderer("angle");

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from "fs";
import path from "path";
import { Logger } from "typescript-template-language-service-decorator";

export function loadTailwindTheme(
  logger: Logger,
  info: ts.server.PluginCreateInfo
): unknown {
  let tailwindTheme: any;

  try {
    const currentDir = info.languageServiceHost.getCurrentDirectory();
    logger.log(`Current directory: ${currentDir}`);

    // TODO: Use a glob like Tailwind extension: '{tailwind,tailwind.config,tailwind.*.config,tailwind.config.*}.{js,cjs}'
    const tailwindConfigPath = path.resolve(currentDir, "tailwind.config.js");
    logger.log(`Tailwind config resolved path: ${tailwindConfigPath}`);

    // Attempt to load stats - this will throw a useful error if file can't be found
    fs.statSync(tailwindConfigPath);
    logger.log(`Tailwind config found`);

    // Resolve the project's Tailwind theme
    const tailwindConfigBase = require(tailwindConfigPath);
    // This assumes that if a project has a Tailwind config they have the package installed as well
    const tailwindResolveConfigPath = require.resolve("tailwindcss/resolveConfig");
    logger.log(`tailwindcss resolved path: ${tailwindResolveConfigPath}`);
    const resolveConfig = require(tailwindResolveConfigPath);

    const tailwindConfig = resolveConfig(tailwindConfigBase);
    tailwindTheme = tailwindConfig.theme;
    logger.log("Loaded tailwind config successfully");
  } catch (err) {
    let message = "unknown";
    if (typeof err === "string") {
      message = err;
    } else if (err instanceof Error) {
      message = `${err.name}: ${err.message}`;
    }

    logger.log(`Loading Tailwind config failed: ${message}`);
  }

  return tailwindTheme;
}

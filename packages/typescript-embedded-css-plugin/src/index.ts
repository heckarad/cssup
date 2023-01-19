import { decorateWithTemplateLanguageService } from "typescript-template-language-service-decorator";

import { CSSTemplateLanguageService } from "./language-service";
import { LanguageServiceLogger } from "./logger";
import { loadTailwindTheme } from "./utils/load-tailwind-theme";

/**
 * Plugin initialization
 * @see https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#setup-and-initialization
 */
function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
  function create(info: ts.server.PluginCreateInfo) {
    const logger = new LanguageServiceLogger(info);
    logger.log("Starting plugin...");

    const tailwindTheme: unknown = loadTailwindTheme(logger, info);

    return decorateWithTemplateLanguageService(
      modules.typescript,
      info.languageService,
      info.project,
      new CSSTemplateLanguageService(modules.typescript, logger, tailwindTheme),
      { tags: ["css"] }
    );
  }

  return { create };
}

export = init;

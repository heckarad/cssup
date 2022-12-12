import { decorateWithTemplateLanguageService } from "typescript-template-language-service-decorator";

import { CSSTemplateLanguageService } from "./language-service";

/**
 * Plugin initialization
 * @see https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#setup-and-initialization
 */
function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
  function create(info: ts.server.PluginCreateInfo) {
    info.project.projectService.logger.info("Starting embedded CSS plugin...");

    return decorateWithTemplateLanguageService(
      modules.typescript,
      info.languageService,
      info.project,
      new CSSTemplateLanguageService(modules.typescript),
      { tags: ["css"] }
    );
  }

  return { create };
}

export = init;

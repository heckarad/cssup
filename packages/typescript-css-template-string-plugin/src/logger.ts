import { Logger } from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";

export class LanguageServiceLogger implements Logger {
  constructor(private readonly info: ts.server.PluginCreateInfo) {}

  public log(msg: string) {
    this.info.project.projectService.logger.info(
      `[typescript-css-template-string-plugin] ${msg}`
    );
  }
}

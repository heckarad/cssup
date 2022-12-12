import { parseClassNamesFromSourceFileText } from "./parse_classnames";

function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
  const ts = modules.typescript;

  function create(info: ts.server.PluginCreateInfo) {
    info.project.projectService.logger.info("Starting CSS template strings plugin...");

    // Set up decorator object
    const proxy: ts.LanguageService = Object.create(null);

    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    // Remove specified entries from completion list
    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const program = info.languageService.getProgram();
      const completions = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        options
      );

      if (!program || !completions) return completions;

      // If this is a completion for classnames there will only be one entry
      if (completions.entries[0].name === "__css") {
        const sourceFile = program.getSourceFile(fileName);

        const classNames = parseClassNamesFromSourceFileText(sourceFile?.text ?? "");

        return {
          isGlobalCompletion: false,
          isMemberCompletion: false,
          isNewIdentifierLocation: false,
          entries: classNames.map((className) => ({
            name: className,
            kind: ts.ScriptElementKind.variableElement,
            kindModifiers: "var",
            sortText: className,
          })),
        };
      }

      // Return original completions when we're not providing className suggestions
      return completions;
    };

    return proxy;
  }

  return { create };
}

export = init;

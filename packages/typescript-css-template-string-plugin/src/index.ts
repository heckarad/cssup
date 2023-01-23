import { parseClassNamesFromSourceFileText } from "./parse-classnames";
import { LanguageServiceLogger } from "./logger";

function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
  const ts = modules.typescript;

  function create(info: ts.server.PluginCreateInfo) {
    const logger = new LanguageServiceLogger(info);
    logger.log("Starting plugin...");

    // Set up decorator object
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- don't know how to avoid this
    const proxy: ts.LanguageService = Object.create(null);

    let k: keyof typeof info.languageService;
    for (k in info.languageService) {
      const x = info.languageService[k];
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args) => x.apply(info.languageService, args);
    }

    // --------------------------------------------------------
    // AUTOCOMPLETE

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

    // --------------------------------------------------------
    // HOVER

    proxy.getQuickInfoAtPosition = (fileName: string, position: number) => {
      const quickInfo = info.languageService.getQuickInfoAtPosition(fileName, position);

      return quickInfo;
      // Notes for better cx hovering:
      // classes hover value:
      // {"kind":"const","kindModifiers":"","textSpan":{"start":445,"length":6},"displayParts":[{"text":"const","kind":"keyword"},{"text":" ","kind":"space"},{"text":"styles","kind":"localName"},{"text":":","kind":"punctuation"},{"text":" ","kind":"space"},{"text":"ClassNames","kind":"aliasName"}],"documentation":[{"text":"Example styles","kind":"text"}]}
      // classname hover value:
      // {"kind":"index","kindModifiers":"declare","textSpan":{"start":452,"length":9},"displayParts":[{"text":"(","kind":"punctuation"},{"text":"index","kind":"text"},{"text":")","kind":"punctuation"},{"text":" ","kind":"space"},{"text":"ClassNames","kind":"aliasName"},{"text":"[","kind":"punctuation"},{"text":"string","kind":"keyword"},{"text":"]","kind":"punctuation"},{"text":":","kind":"punctuation"},{"text":" ","kind":"space"},{"text":"string","kind":"keyword"}],"documentation":[]}
    };

    return proxy;
  }

  return { create };
}

export = init;

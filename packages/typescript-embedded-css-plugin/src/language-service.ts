/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Logger,
  TemplateContext,
  TemplateLanguageService,
} from "typescript-template-language-service-decorator";
import ts from "typescript/lib/tsserverlibrary";
import {
  getSCSSLanguageService,
  LanguageService,
  Stylesheet,
} from "vscode-css-languageservice";
import * as vscode from "vscode-languageserver-types";
import delve from "dlv";

// Unexported enum value from vscode-css-languageservice/src/parser/cssNodes
const FUNCTION_NODE_TYPE = 30;
const EXPRESSION_NODE_TYPE = 22;

/**
 * Main class for language service.
 * @remarks
 * To see all of the methods supported by the class view the type of the
 * TemplateLanguageService
 * @see typescript-styled-plugin:_language-service.ts
 */
export class CSSTemplateLanguageService implements TemplateLanguageService {
  // --------------------------------------------------------
  // CLASS PROPERTIES

  /**
   * Standard logging implementation
   */
  private readonly logger: Logger;

  /**
   * TypeScript API
   * @remarks
   * the plugin must use the same TS version as the compiler to avoid version
   * mismatch errors */
  private readonly typescript: typeof ts;

  /**
   * Project Tailwind theme (if one exists)
   */
  private readonly tailwindTheme: any;

  /**
   * @see https://github.com/microsoft/vscode-css-languageservice
   * @remarks
   * Internal getter allows lazily creating an instance of language service only
   * when needed - reduces overhead of plugin startup.
   */
  private get scssLanguageService(): LanguageService {
    if (!this._scssLanguageService) {
      this._scssLanguageService = getSCSSLanguageService();
      // TODO: Pass a configuration (step seen in other plugins):
      // this._scssLanguageService.configure(this.configurationManager.config);
    }
    return this._scssLanguageService;
  }
  private _scssLanguageService?: LanguageService;

  constructor(typescript: typeof ts, logger: Logger, tailwindTheme: unknown) {
    this.logger = logger;
    this.typescript = typescript;
    this.tailwindTheme = tailwindTheme;
  }

  // --------------------------------------------------------
  // AUTOCOMPLETE

  /**
   * Handles getting the completion entries from the SCSS language service and
   * converting them to a TS CompletionInfo value
   */
  getCompletionsAtPosition(
    context: TemplateContext,
    position: ts.LineAndCharacter
  ): ts.CompletionInfo {
    if (this.isEmptyTemplate(context)) return emptyCompletionItems;

    const { doc, stylesheet } = this.createDocumentAndStylesheet(context);
    const offset = doc.offsetAt(position);

    const languageCompletions = this.scssLanguageService
      .doComplete(doc, position, stylesheet)
      .items.map((completionItem) => ({
        name: completionItem.label,
        kind: translateCompletionItemKind(this.typescript, completionItem.kind),
        kindModifiers: "",
        sortText: completionItem.sortText || completionItem.label,
      }));

    const tailwindThemeCompletions = this.getTailwindThemeCompletions(stylesheet, offset);

    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: [...languageCompletions, ...tailwindThemeCompletions],
    };
  }

  /**
   * Determines Tailwind theme completions
   */
  private getTailwindThemeCompletions(
    stylesheet: Stylesheet,
    offset: number
  ): ts.CompletionEntry[] {
    if (!this.tailwindTheme) return [];
    this.logger.log(`getTailwindThemeCompletions at offset ${offset}`);

    // @ts-expect-error -- Stylesheet methods aren't typed
    const node = stylesheet.findChildAtOffset(offset, true);
    // findParent: https://github.com/microsoft/vscode-css-languageservice/blob/ed64674c2b77efdb12a704167df69307fdd055ee/src/parser/cssNodes.ts#L384
    const functionParentNode = node.findParent(FUNCTION_NODE_TYPE);
    this.logger.log(`Found parent: ${String(Boolean(functionParentNode))}`);
    if (!functionParentNode || !functionParentNode.startsWith("theme")) return [];

    const expressionNode = node.findParent(EXPRESSION_NODE_TYPE);
    if (!expressionNode) return [];

    const themePath: string = expressionNode.getText().replace(/"|'/g, "");
    this.logger.log(`themePath: ${themePath}`);

    return getTailwindThemeSuggestions(this.tailwindTheme, themePath, this.logger).map(
      (themeCompletion) => {
        this.logger.log(`theme suggestion: ${themeCompletion}`);

        return {
          name: themeCompletion,
          kind: this.typescript.ScriptElementKind.unknown,
          kindModifiers: undefined, // ??ScriptElementKindModifier
          sortText: themeCompletion,

          // labelDetails: {
          //   description: "description", // Shows right justified after suggestion
          //   detail: "detail", // Shows inline immediately after the suggestion
          // },
          // insertText?: string;
          // isSnippet?: true;
          // source: string,
          // sourceDisplay?: SymbolDisplayPart[];
        };
      }
    );
  }

  // --------------------------------------------------------
  // HOVER

  /**
   * Handles getting the hover details from the SCSS language service at the
   * passed position
   */
  getQuickInfoAtPosition(
    context: TemplateContext,
    position: ts.LineAndCharacter
  ): ts.QuickInfo | undefined {
    if (this.isEmptyTemplate(context)) return undefined;

    const { doc, stylesheet } = this.createDocumentAndStylesheet(context);

    const hover = this.scssLanguageService.doHover(doc, position, stylesheet);
    if (!hover) return undefined;
    this.logger.log(`hover: ${JSON.stringify(hover)}`);

    // Convert hover.range to QuickInfo.textSpan shape
    let textSpan = {
      start: doc.offsetAt(position),
      length: 1,
    };
    if (hover.range) {
      textSpan = translateRange(context, hover.range);
    }

    // Convert hover.contents to QuickInfo.documentation
    const documentation: ts.SymbolDisplayPart[] = [];
    const convertContents = (hoverContents: typeof hover.contents) => {
      if (typeof hoverContents === "string") {
        documentation.push({ kind: "unknown", text: hoverContents });
      } else if (Array.isArray(hoverContents)) {
        hoverContents.forEach(convertContents);
      } else {
        documentation.push({ kind: "unknown", text: hoverContents.value });
      }
    };
    convertContents(hover.contents);

    return {
      kind: this.typescript.ScriptElementKind.unknown,
      kindModifiers: "",
      textSpan,
      displayParts: [],
      documentation,
      tags: [],
    };
  }

  // --------------------------------------------------------
  // LINTING

  /**
   * Handles getting the diagnostics from the SCSS language service and
   * converting them to TS Diagnostics
   */
  getSyntacticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
    if (this.isEmptyTemplate(context)) return [];

    const { doc, stylesheet } = this.createDocumentAndStylesheet(context);

    return this.scssLanguageService.doValidation(doc, stylesheet).map((diagnostic) => {
      const { start, length } = translateRange(context, diagnostic.range);

      return {
        category: translateDiagnosticLevel(this.typescript, diagnostic.severity),
        code: typeof diagnostic.code === "number" ? diagnostic.code : 0,
        source: diagnostic.source,
        file: undefined,
        messageText: diagnostic.message,
        length,
        start,
      };
    });
  }

  // --------------------------------------------------------
  // UTILITY METHODS

  /**
   * Indicates template string contents are empty and language services should
   * bail early.
   */
  private isEmptyTemplate(context: TemplateContext) {
    return context.text === "``";
  }

  /**
   * Creates a virtual document for the template string content that can be passed
   * to the CSS language services
   * @see typescript-styled-plugin:_virtual-document-provider.ts
   */
  private createDocumentAndStylesheet(context: TemplateContext) {
    const contents = context.text;

    const doc = {
      uri: "untitled://embedded.scss",
      languageId: "scss",
      lineCount: contents.split(/\n/g).length + 1,
      version: 1,
      getText: () => contents,
      positionAt: (offset: number) => {
        return context.toPosition(offset);
      },
      offsetAt: (position: ts.LineAndCharacter) => {
        return context.toOffset(position);
      },
    };
    const stylesheet = this.scssLanguageService.parseStylesheet(doc);

    return { doc, stylesheet };
  }
}

// --------------------------------------------------------
// UTILS

/**
 * Translates a VSCode range to `start` and `length` values.
 */
function translateRange(
  context: TemplateContext,
  range: vscode.Range
): { start: number; length: number } {
  const startOffset = context.toOffset(range.start);
  const endOffset = context.toOffset(range.end);

  return {
    start: startOffset,
    length: endOffset - startOffset,
  };
}

/**
 * Translates a VSCode Diagnostic Severity code to a TS DiagnosticCategory code
 */
function translateDiagnosticLevel(
  typescript: typeof ts,
  severity?: vscode.DiagnosticSeverity
): ts.DiagnosticCategory {
  if (!severity) return typescript.DiagnosticCategory.Message;

  switch (severity) {
    case vscode.DiagnosticSeverity.Error:
      return typescript.DiagnosticCategory.Error;
    case vscode.DiagnosticSeverity.Hint:
      return typescript.DiagnosticCategory.Suggestion;
    case vscode.DiagnosticSeverity.Warning:
      return typescript.DiagnosticCategory.Warning;
    case vscode.DiagnosticSeverity.Information:
      return typescript.DiagnosticCategory.Message;
    default:
      return typescript.DiagnosticCategory.Message;
  }
}

/**
 * Translates a VSCode CompletionItem kind to a TS CompletionEntry kind
 * @see typescript-styled-plugin:_language-service.ts
 */
function translateCompletionItemKind(
  typescript: typeof ts,
  kind?: vscode.CompletionItemKind
): ts.ScriptElementKind {
  if (!kind) return typescript.ScriptElementKind.unknown;

  switch (kind) {
    case vscode.CompletionItemKind.Method:
      return typescript.ScriptElementKind.memberFunctionElement;
    case vscode.CompletionItemKind.Function:
      return typescript.ScriptElementKind.functionElement;
    case vscode.CompletionItemKind.Constructor:
      return typescript.ScriptElementKind.constructorImplementationElement;
    case vscode.CompletionItemKind.Field:
    case vscode.CompletionItemKind.Variable:
      return typescript.ScriptElementKind.variableElement;
    case vscode.CompletionItemKind.Class:
      return typescript.ScriptElementKind.classElement;
    case vscode.CompletionItemKind.Interface:
      return typescript.ScriptElementKind.interfaceElement;
    case vscode.CompletionItemKind.Module:
      return typescript.ScriptElementKind.moduleElement;
    case vscode.CompletionItemKind.Property:
      return typescript.ScriptElementKind.memberVariableElement;
    case vscode.CompletionItemKind.Unit:
    case vscode.CompletionItemKind.Value:
      return typescript.ScriptElementKind.constElement;
    case vscode.CompletionItemKind.Enum:
      return typescript.ScriptElementKind.enumElement;
    case vscode.CompletionItemKind.Keyword:
      return typescript.ScriptElementKind.keyword;
    case vscode.CompletionItemKind.Color:
      return typescript.ScriptElementKind.constElement;
    case vscode.CompletionItemKind.Reference:
      return typescript.ScriptElementKind.alias;
    case vscode.CompletionItemKind.File:
      return typescript.ScriptElementKind.moduleElement;
    case vscode.CompletionItemKind.Snippet:
    case vscode.CompletionItemKind.Text:
    default:
      return typescript.ScriptElementKind.unknown;
  }
}

const emptyCompletionItems = {
  isGlobalCompletion: false,
  isMemberCompletion: false,
  isNewIdentifierLocation: false,
  entries: [],
};

/**
 * Returns a list of suggestions for the themePath, eg 'colors.blu'
 */
function getTailwindThemeSuggestions(
  theme: any,
  themePath: string,
  logger: Logger
): string[] {
  // themePath value when user hasn't begun typing expression yet
  if (themePath === "theme()") return convertValueToList(theme, logger);

  // If themePath matches an object exactly
  let found = delve(theme, themePath);
  if (found) return convertValueToList(found, logger);

  // If themePath ends with '.'
  if (themePath.endsWith(".")) {
    found = delve(theme, themePath.slice(0, -1));
    return convertValueToList(found, logger);
  }

  // If themePath matches some keys in an object
  // WHERE the path has only segment
  const segments = themePath.split(".");
  if (segments.length === 1) {
    return convertValueToList(theme, logger).filter((key) => key.startsWith(themePath));
  }

  // WHERE the path has multiple segments
  const keyValue = segments.pop() || "";
  found = delve(theme, segments.join("."));
  if (found) {
    return convertValueToList(found, logger).filter((key) => key.startsWith(keyValue));
  }

  return [];
}

function convertValueToList(value: unknown, logger: Logger): string[] {
  if (Array.isArray(value)) {
    return value.filter(isString);
  } else if (value !== null && typeof value === "object") {
    return Object.keys(value);
  } else if (typeof value === "string") {
    return [value];
  }

  logger.log(`convertValueToList unknown: ${JSON.stringify(value)}`);
  return [];
}

function isString(val: unknown): val is string {
  return typeof val === "string";
}

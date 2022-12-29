import {
  Logger,
  TemplateContext,
  TemplateLanguageService,
} from "typescript-template-language-service-decorator";
import ts from "typescript/lib/tsserverlibrary";
import { getSCSSLanguageService, LanguageService } from "vscode-css-languageservice";
import * as vscode from "vscode-languageserver-types";

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
   * @see https://github.com/microsoft/vscode-css-languageservice
   * @remarks
   * Internal getter allows lazily creating an instance of language service only
   * when needed - reduces overhead of plugin startup.
   */
  private get scssLanguageService(): LanguageService {
    if (!this._scssLanguageService) {
      this._scssLanguageService = getSCSSLanguageService();
      // TODO:
      // this._scssLanguageService.configure(this.configurationManager.config);
    }
    return this._scssLanguageService;
  }
  private _scssLanguageService?: LanguageService;

  constructor(typescript: typeof ts, logger: Logger) {
    this.logger = logger;
    this.typescript = typescript;
  }

  // --------------------------------------------------------
  // PUBLIC METHODS

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
    this.logger.log(`Getting completion items:\n${doc.getText()}`);

    const completions = this.scssLanguageService.doComplete(doc, position, stylesheet);

    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: completions.items.map((completionItem) => ({
        name: completionItem.label,
        kind: translateCompletionItemKind(this.typescript, completionItem.kind),
        kindModifiers: "",
        sortText: completionItem.sortText || completionItem.label,
      })),
    };
  }

  /**
   * Handles getting the diagnostics from the SCSS language service and
   * converting them to TS Diagnostics
   */
  getSyntacticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
    if (this.isEmptyTemplate(context)) return [];

    const { doc, stylesheet } = this.createDocumentAndStylesheet(context);
    this.logger.log(`Getting diagnostics:\n${doc.getText()}`);

    const diagnostics = this.scssLanguageService.doValidation(doc, stylesheet);

    return diagnostics.map((diagnostic) => {
      const { start, length } = translateRange(context, diagnostic.range);

      return {
        category: translateDiagnosticLevel(this.typescript, diagnostic.severity),
        code: typeof diagnostic.code === "number" ? diagnostic.code : 0,
        file: undefined,
        messageText: diagnostic.message,
        length,
        start,
      };
    });
  }

  // --------------------------------------------------------
  // INTERNAL METHODS

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

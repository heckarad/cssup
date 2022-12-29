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

  // getSyntacticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
  //   return [
  //     {
  //       start: 2,
  //       length: 2,
  //       category: ts.DiagnosticCategory.Error,
  //       messageText: "oh no!",
  //       file: undefined,
  //       code: 0,
  //     },
  //   ];
  // }

  /**
   * Handles getting the completion entries from the SCSS language service and
   * converting them to a TS CompletionInfo value
   */
  getCompletionsAtPosition(
    context: TemplateContext,
    position: ts.LineAndCharacter
  ): ts.CompletionInfo {
    const items = this.getCompletionItems(context, position);

    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: items.map((completionItem) => ({
        name: completionItem.label,
        kind: translateCompletionItemKind(this.typescript, completionItem.kind),
        kindModifiers: "",
        sortText: completionItem.sortText || completionItem.label,
      })),
    };
  }

  // --------------------------------------------------------
  // INTERNAL METHODS

  /**
   * Implementation details for getting the set of completion items from the CSS
   * language service.
   * @private
   */
  private getCompletionItems(context: TemplateContext, position: ts.LineAndCharacter) {
    const text = context.node.getText();
    /**
     * Bail early when completions are requested for an empty template, the
     * language servers will request everything which can block for 3-4 seconds.
     **/
    if (text === "``") return [];

    this.logger.log(`Getting completion items:\n${text}`);

    // 1. Create a virtual document with the template context
    // 2. Create a stylesheet with the virtual document
    // 3. Get completions by calling doComplete on stylesheet
    const doc = createVirtualDocument(context);
    const stylesheet = this.scssLanguageService.parseStylesheet(doc);
    const completions = this.scssLanguageService.doComplete(doc, position, stylesheet);

    return completions.items;
  }
}

// --------------------------------------------------------
// UTILS

/**
 * Creates a virtual document for the template string content that can be passed
 * to the CSS language services
 * @see typescript-styled-plugin:_virtual-document-provider.ts
 */
function createVirtualDocument(context: TemplateContext) {
  const contents = context.text;
  return {
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

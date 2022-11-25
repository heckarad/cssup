function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
  const ts = modules.typescript

  function create(info: ts.server.PluginCreateInfo) {
    info.project.projectService.logger.info('Starting CSS template strings plugin...')

    // Set up decorator object
    const proxy: ts.LanguageService = Object.create(null)

    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args)
    }

    // Remove specified entries from completion list
    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const prior = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        options,
      )

      const definition = info.languageService.getDefinitionAtPosition(fileName, position)
      const implementation = info.languageService.getImplementationAtPosition(
        fileName,
        position,
      )
      const typeDefinition = info.languageService.getTypeDefinitionAtPosition(
        fileName,
        position,
      )

      info.project.projectService.logger.info(
        `HEDGE: INFO: definition: ${JSON.stringify(definition)}`,
      )
      info.project.projectService.logger.info(
        `HEDGE: INFO: implementation: ${JSON.stringify(implementation)}`,
      )
      info.project.projectService.logger.info(
        `HEDGE: INFO: typeDefinition: ${JSON.stringify(typeDefinition)}`,
      )

      info.project.projectService.logger.info(`HEDGE: Entries:`)

      prior?.entries.forEach((completionEntry) => {
        info.project.projectService.logger.info(
          `HEDGE: Entry: name: ${completionEntry.name},`,
        )
        const entrySymbol = info.languageService.getCompletionEntrySymbol(
          fileName,
          position,
          completionEntry.name,
          undefined,
        )

        entrySymbol?.declarations?.forEach((declaration) => {
          const symbolText = declaration.getFullText()
          info.project.projectService.logger.info(`HEDGE: symbolText: ${symbolText}`)
        })
      })

      return prior
    }

    return proxy
  }

  return { create }
}

export = init

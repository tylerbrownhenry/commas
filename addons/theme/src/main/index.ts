import * as commas from 'commas:api/main'

export default () => {

  commas.i18n.addTranslationDirectory('locales')

  commas.ipcMain.handle('reset-theme', () => {
    const settings = commas.settings.useSettings()
    delete settings['terminal.theme.name']
    delete settings['terminal.theme.customization']
  })

}

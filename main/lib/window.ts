import * as path from 'path'
import { effect, stop, unref } from '@vue/reactivity'
import { app, BrowserWindow, ipcMain } from 'electron'
import { globalHandler } from '../utils/handler'
import { loadCustomCSS } from './addon'
import { hasWindow, getLastWindow } from './frame'
import { createTouchBar, createWindowMenu } from './menu'
import { handleEvents } from './message'
import { useThemeOptions } from './theme'

function createWindow(...args: string[]) {
  const options = {
    show: false,
    title: app.name,
    width: (8 * 80) + (2 * 8) + 180,
    minWidth: (8 * 40) + (2 * 8) + 180,
    height: (17 * 25) + (2 * 4) + 36,
    frame: false,
    titleBarStyle: 'hiddenInset' as const,
    transparent: true,
    acceptFirstMouse: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      additionalArguments: [
        '--',
        ...args.filter(arg => (arg as string | undefined) !== undefined),
      ],
    },
  }
  // frame offset
  if (hasWindow()) {
    const rect = getLastWindow().getBounds()
    Object.assign(options, {
      x: rect.x + 30,
      y: rect.y + 30,
    })
  }
  const frame = new BrowserWindow(options)
  // Fix shadow issue on macOS
  if (process.platform === 'darwin') {
    frame.setSize(options.width - 1, options.height - 1)
    frame.setWindowButtonVisibility(false)
    frame.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        frame.setSize(options.width, options.height)
        frame.setWindowButtonVisibility(true)
      }, 500)
    })
  }
  frame.loadFile(path.resolve(__dirname, '../../renderer/dist/index.html'))
  // gracefully show window
  frame.once('ready-to-show', () => {
    frame.show()
  })
  // insert custom css
  loadCustomCSS(frame)
  // these handler must be bound in main process
  handleEvents(frame)
  // reactive effects
  const themeOptionsRef = useThemeOptions()
  const reactiveEffect = effect(() => {
    const themeOptions = unref(themeOptionsRef)
    if (process.platform === 'darwin') {
      createTouchBar(frame)
    } else {
      createWindowMenu(frame)
    }
    frame.setBackgroundColor(themeOptions.backgroundColor)
    frame.setVibrancy(themeOptions.vibrancy ?? null)
  })
  frame.on('closed', () => {
    stop(reactiveEffect)
  })
  return frame
}

function handleWindowMessages() {
  ipcMain.handle('open-window', () => {
    createWindow()
  })
  globalHandler.handle('global:open-window', () => {
    createWindow()
  })
}

export {
  createWindow,
  handleWindowMessages,
}

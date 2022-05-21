import { ipcRenderer } from 'electron'
import { customRef, toRaw, watchEffect } from 'vue'

export function injectIPC<T>(key: string, defaultValue: T, token?: string) {
  return customRef<T>((track, trigger) => {
    let value = defaultValue
    ipcRenderer.invoke(`get-ref:${key}`, token).then((newValue: T) => {
      value = newValue
      trigger()
    })
    watchEffect((onInvalidate) => {
      const handler = (event, newValue: T, currentToken?: string) => {
        if (token && currentToken !== token) return
        value = newValue
        trigger()
      }
      ipcRenderer.on(`update-ref:${key}`, handler)
      onInvalidate(() => {
        ipcRenderer.send(`stop-ref:${key}`, token)
        ipcRenderer.off(`update-ref:${key}`, handler)
      })
    })
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        ipcRenderer.invoke(`set-ref:${key}`, toRaw(newValue), token)
      },
    }
  })
}

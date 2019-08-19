import fallback from '@assets/themes/oceanic-next.json'
import {colors} from '@/utils/theme'
import FileStorage from '@/utils/storage'

const downloadURL = 'https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/windowsterminal'

export default {
  namespaced: true,
  state: {
    fallback,
    name: null,
    theme: null,
    watcher: null,
  },
  mutations: {
    setName(state, value) {
      state.name = value
    },
    setTheme(state, value) {
      state.theme = value
    },
    setWatcher(state, value) {
      state.watcher = value
    },
  },
  actions: {
    async load({state, dispatch, rootState}) {
      const settings = rootState.settings.settings
      const name = settings['terminal.theme.name']
      if (name !== state.name) {
        return dispatch('apply', {name})
      }
    },
    async apply({commit, dispatch, rootState}, {name, download}) {
      const theme = {...fallback}
      const settings = rootState.settings.settings
      const configured = settings['terminal.theme.name']
      if (name && name !== 'oceanic-next') {
        const path = `themes/${name}.json`
        let file = await FileStorage.assets().load(path)
        if (!file) {
          file = await FileStorage.load(path)
          if (!file && download) {
            file = await FileStorage.download(path, `${downloadURL}/${name}.json`)
          }
          if (file) dispatch('watch', path)
        }
        if (file) Object.assign(theme, file)
      }
      commit('setName', name)
      if (name !== configured) {
        dispatch('settings/update', {'terminal.theme.name': name}, {root: true})
      }
      const customization = settings['terminal.theme.customization']
      if (customization) {
        Object.assign(theme, customization)
      }
      await dispatch('eject')
      commit('setTheme', theme)
      dispatch('inject')
    },
    inject({state, rootState}) {
      const theme = state.theme
      const settings = rootState.settings.settings
      const element = document.createElement('style')
      element.id = 'app-theme'
      const properties = {}
      colors.forEach(key => {
        if (!theme[key]) return
        properties[`--theme-${key.toLowerCase()}`] = theme[key]
      })
      // TODO: use custom.css instead of styles in settings.json
      properties['font-size'] = settings['terminal.style.fontSize'] + 'px'
      properties['font-family'] = settings['terminal.style.fontFamily']
      const declarations = Object.keys(properties)
        .map(key => `${key}: ${properties[key]};`).join(' ')
      element.appendChild(document.createTextNode(`#main { ${declarations} }`))
      document.head.appendChild(element)
      if (theme.type) document.body.classList.add(theme.type)
    },
    eject({state}) {
      const theme = state.theme
      if (!theme) return
      // TODO: performance review
      const element = document.getElementById('app-theme')
      if (element) element.remove()
      if (theme.type) document.body.classList.remove(theme.type)
    },
    watch({state, commit, dispatch}, file) {
      if (state.watcher) state.watcher.close()
      const watcher = FileStorage.watch(file, async () => {
        await dispatch('load')
        dispatch('terminal/refresh', null, {root: true})
      })
      commit('setWatcher', watcher)
    },
  },
}

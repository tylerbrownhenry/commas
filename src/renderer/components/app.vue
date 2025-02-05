<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import { onMounted } from 'vue'
import * as commas from '../../../api/core-renderer'
import { loadAddons, loadCustomJS } from '../compositions/addon'
import {
  handleFrameMessages,
  useFullscreen,
} from '../compositions/frame'
import { handleI18nMessages } from '../compositions/i18n'
import { injectSettingsStyle, useSettings } from '../compositions/settings'
import {
  confirmClosing,
  handleShellMessages,
  useIsTabListEnabled,
  useWillQuit,
} from '../compositions/shell'
import {
  createTerminalTab,
  handleTerminalMessages,
  useTerminalTabs,
} from '../compositions/terminal'
import { injectThemeStyle, useTheme } from '../compositions/theme'
import ActionBar from './ActionBar.vue'
import FindBox from './FindBox.vue'
import TabList from './TabList.vue'
import TerminalView from './TerminalView.vue'
import TitleBar from './TitleBar.vue'
import '@phosphor-icons/web/bold'
import '@phosphor-icons/web/regular'
import 'devicon'

const settings = useSettings()
const theme = useTheme()
const isFullscreen = $(useFullscreen())
const isTabListEnabled = $(useIsTabListEnabled())
const tabs = $(useTerminalTabs())
const willQuit: boolean = $(useWillQuit())

const hasHorizontalTabList = $computed(() => {
  const position = settings['terminal.view.tabListPosition']
  return position === 'top' || position === 'bottom'
})

const slots = commas.proxy.context.getCollection('terminal.ui-slot')

loadAddons()
loadCustomJS()
injectSettingsStyle()
injectThemeStyle()
handleFrameMessages()
handleI18nMessages()
handleShellMessages()
handleTerminalMessages()

const startIndex = process.argv.indexOf('--') + 1
const args = startIndex ? process.argv.slice(startIndex) : []
const initialPath = args[0]
createTerminalTab({ cwd: initialPath })

window.addEventListener('beforeunload', async event => {
  if (!willQuit && tabs.length > 1) {
    event.returnValue = false
    const confirmed = await confirmClosing()
    if (confirmed) {
      commas.addon.unloadAddons()
      commas.proxy.app.events.emit('unload')
      ipcRenderer.invoke('destroy')
    }
  } else {
    commas.addon.unloadAddons()
    commas.proxy.app.events.emit('unload')
  }
})

onMounted(() => {
  commas.proxy.app.events.emit('ready')
})
</script>

<template>
  <div :class="['app', { 'is-opaque': isFullscreen, 'is-vibrant': theme.vibrancy }]">
    <TitleBar />
    <div class="content">
      <TabList v-if="!hasHorizontalTabList" v-show="isTabListEnabled" />
      <main class="interface">
        <FindBox />
        <TerminalView />
      </main>
    </div>
    <ActionBar />
    <component
      :is="slot"
      v-for="(slot, index) in slots"
      :key="index"
      class="slot"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

@property --scrollbar-opacity {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

// https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/color#system-colors
:global(:root) {
  --system-red: 255 69 58;
  --system-yellow: 255 214 10;
  --system-green: 50 215 75;
  --system-cyan: 102 212 207;
  --system-blue: 10 132 255;
  --system-magenta: 255 55 95;
  --system-accent: var(--system-blue);
  --design-card-background: rgb(var(--theme-foreground) / 0.15);
  --design-input-background: rgb(127 127 127 / 0.2);
  --design-separator: rgb(127 127 127 / 0.2);
}
:global(::selection) {
  background: rgb(var(--theme-selectionbackground));
}
:global(body) {
  margin: 0;
  cursor: default;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
:global(.ph-bold) {
  line-height: inherit;
}
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  color: rgb(var(--theme-foreground));
  /* Default line height of xterm.js */
  line-height: 1.2;
  overflow: hidden;
  transition: color 0.2s;
  &.is-vibrant {
    --vibrancy-filter: drop-shadow(0 0 0.5em rgb(var(--theme-background))) blur(2px);
  }
}
.content {
  z-index: 1;
  display: flex;
  flex: auto;
  width: 100vw;
  overflow: hidden;
}
.interface {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  background: rgb(var(--theme-background) / var(--theme-opacity));
  box-shadow: 0 0 4px 0px rgb(0 0 0 / 5%);
  transition: background 0.2s;
  .app.is-opaque & {
    background: rgb(var(--theme-background));
  }
}
</style>

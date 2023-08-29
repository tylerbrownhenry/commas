<script lang="ts" setup>
import type { TerminalTab, TerminalTabCharacter } from '../../typings/terminal'
import type { IconEntry } from '../assets/icons'
import { useSettings } from '../compositions/settings'
import { closeTerminalTab, getTerminalTabTitle, useCurrentTerminal } from '../compositions/terminal'
import { getIconEntry } from '../utils/terminal'

const { tab, character, closable = false } = defineProps<{
  tab?: TerminalTab | undefined,
  character?: TerminalTabCharacter | undefined,
  closable?: boolean,
}>()

const emit = defineEmits<{
  (event: 'close', tab: TerminalTab | undefined): void,
}>()

defineSlots<{
  operations?: (props: {}) => any,
}>()

const settings = useSettings()
const terminal = $(useCurrentTerminal())

const isFocused: boolean = $computed(() => {
  return Boolean(tab) && terminal === tab
})

const isActive = $computed(() => {
  if (isFocused) return true
  return terminal?.group && tab?.group
    && terminal.group === tab.group
})

const pane = $computed(() => {
  console.log('tab',tab);
  if (!tab) return null
  return tab.pane
})

const iconEntry = $computed(() => {
  let defaultIcon: IconEntry | undefined
  if (character) {
    if (character.icon) {
      return character.icon
    } else {
      defaultIcon = character.defaultIcon
    }
  }
  if (tab) {
    if (pane && !tab.shell) {
      if (pane.icon) return pane.icon
    } else {
      return getIconEntry(tab)
    }
  }
  return defaultIcon
})

const title = $computed(() => {
  console.log('character',character);

  if (character?.title) return character.title
  return tab ? getTerminalTabTitle(tab) : ''
})

const idleState = $computed(() => {
  if (!tab) return ''
  if (tab.alerting) return 'alerting'
  if (typeof tab.idle === 'boolean') return tab.idle ? 'idle' : 'busy'
  if (tab.command === '') return 'idle'
  if (pane) return ''
  if (tab.process === tab.shell) return 'idle'
  return 'busy'
})

const thumbnail = $computed(() => {
  if (!tab) return ''
  if (pane) return ''
  if (!settings['terminal.tab.livePreview']) return ''
  const tabListPosition = settings['terminal.view.tabListPosition']
  if (tabListPosition === 'top' || tabListPosition === 'bottom') return ''
  if (idleState === 'idle') return ''
  if (tab.thumbnail) return tab.thumbnail
  return ''
})

function close() {
  
  if (!closable && tab) {
    closeTerminalTab(tab)
  }
  emit('close', tab)
}
</script>

<template>
  <div :class="['tab-item', { active: isActive, focused: isFocused, virtual: !tab }]">
    <div class="tab-item-card">
      <div class="tab-overview">
        <div class="tab-title">
          <div v-if="idleState" :class="['idle-light', idleState]"></div>
          <span
            v-if="iconEntry"
            :style="{ color: isFocused ? iconEntry.color : 'inherit' }"
            :class="['tab-icon', iconEntry.name]"
          ></span>
          <span v-else-if="pane && tab!.shell" class="tab-icon ph-bold ph-file"></span>
          <span v-else class="tab-icon ph-bold ph-terminal"></span>
          <span class="tab-name">{{ title }}</span>
        </div>
        <div class="right-side">
          <div class="operations">
            <slot name="operations"></slot>
            <div v-if="closable || tab" class="button close" @click.stop="close">
              <div class="ph-bold ph-x"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="thumbnail" class="tab-thumbnail">{{ thumbnail }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-item {
  padding: 25px; // 8px
  padding-top: 10px;
  cursor: pointer;
  .tab-list.vertical & {
    padding-bottom: 0;
  }
  .tab-list.horizontal & {
    padding-right: 0;
  }
}
.tab-title {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  opacity: 0.75;
  transition: opacity 0.2s;
  .tab-item.virtual & {
    opacity: 0.5;
  }
  .tab-item.focused &,
  .sortable-item.dragging & {
    opacity: 1;
  }
  .sortable-item.dragging & {
    color: rgb(var(--system-yellow));
  }
}
.tab-icon {
  display: inline-block;
  flex: none;
  margin-right: 15px; // 6px
  background: black;
  border-radius: 5px;
  padding: 5px;
  font-size: 11px;
  font-weight: 800;
  margin-left: 0px;
}
.tab-name {
  flex: auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: color 0.2s;
}
.tab-item-card {
  padding: 0 8px;
  border-radius: 8px;
  .tab-item.active & {
    background: linear-gradient(to right, transparent, var(--design-card-background));
  }
  .tab-item.focused & {
    background: var(--design-card-background);
  }
  .tab-item:hover & {
    background: var(--design-card-background);
  }
}
.tab-overview {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--min-tab-height);
}
.right-side {
  flex: none;
}
.idle-light {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 6px;
  vertical-align: 1px;
  background: currentColor;
  border-radius: 50%;
  transition: color 0.2s;

  position: absolute;
  top: -5px;
  width: 10px;
  height: 10px;
  left: -10px;
  &.busy {
    color: rgb(var(--system-green));
  }
  &.alerting {
    color: rgb(var(--system-yellow));
  }
  .tab-item:hover & {
    display: none;
  }
}
.operations {
  display: none;
  font-size: 14px;
  text-align: center;
  .tab-item:hover & {
    display: flex;
  }
}
.button {
  width: 18px;
  transition: color 0.2s;
  cursor: pointer;
}
.close:hover {
  color: rgb(var(--system-red));
}
.tab-thumbnail {
  padding-bottom: calc((var(--min-tab-height) - 16px) / 2);
  color: rgb(var(--theme-foreground) / 0.5);
  font-style: italic;
  font-size: 12px;
  line-height: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>

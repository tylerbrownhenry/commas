import { markRaw, unref } from '@vue/reactivity'
import { useAddonKeyBindings } from '../../main/lib/keybinding'
import type { KeyBinding } from '../../typings/menu'
import type { MainAPIContext } from '../types'

function addKeyBinding(item: KeyBinding) {
  const addonKeyBindings = unref(useAddonKeyBindings())
  addonKeyBindings.push(markRaw(item))
}

function removeKeyBinding(item: KeyBinding) {
  const addonKeyBindings = unref(useAddonKeyBindings())
  const index = addonKeyBindings.indexOf(item)
  if (index !== -1) {
    addonKeyBindings.splice(index, 1)
  }
}

function add(this: MainAPIContext, binding: KeyBinding) {
  addKeyBinding(binding)
  this.$.app.onCleanup(() => {
    removeKeyBinding(binding)
  })
}

export * from '../shim'

export {
  add,
}

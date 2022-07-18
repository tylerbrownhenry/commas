import * as commas from 'commas:api/renderer'
import UpdaterLink from './UpdaterLink.vue'

export default () => {

  commas.context.provide('preference.item', {
    component: UpdaterLink,
    group: 'about',
  })

}

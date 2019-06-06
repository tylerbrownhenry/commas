import settings from './settings'
import theme from './theme'
import terminal from './terminal'
import launcher from './launcher'
import command from './command'
import shell from './shell'
import proxy from './proxy'

export default {
  children: {
    settings,
    theme,
    terminal,
    launcher,
    command,
    shell,
    proxy,
  },
}

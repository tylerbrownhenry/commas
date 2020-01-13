import {promises as fs} from 'fs'
import {hostname, userInfo} from 'os'
import {basename, sep} from 'path'
import {remote} from 'electron'
import {exec} from './electron'
import {createIDGenerator} from './identity'
import {translate} from './i18n'
import icons from '@assets/icon.json'

const generateID = createIDGenerator(id => id - 1)

const createInternalTerminal = (title, icon) => ({
  internal: {
    icon: `feather-icon ${icon}`,
  },
  id: generateID(),
  process: remote.app.name,
  title: translate(title),
  cwd: '',
})

export const InternalTerminals = {
  settings: createInternalTerminal('Settings#!7', 'icon-settings'),
  proxy: createInternalTerminal('Proxy Rules#!23', 'icon-navigation'),
  theme: createInternalTerminal('Theme#!27', 'icon-feather'),
}

export function quote(command, q) {
  return `${q}${command.replace(new RegExp(q, 'g'), `${q}\\${q}${q}`)}${q}`
}

export function resolveHome(directory) {
  if (!directory) return directory
  return directory.startsWith('~') ?
    process.env.HOME + directory.slice(1) : directory
}

export function omitHome(directory) {
  if (!directory || process.platform === 'win32') return directory
  return directory.startsWith(process.env.HOME) ?
    '~' + directory.slice(process.env.HOME.length) : directory
}

// Supports WSL Style `/mnt/c/Users` and MinGW Style `/c/Users`
export function resolveWindowsDisk(directory) {
  if (!directory) return directory
  const slices = directory.split('/')
  if (slices[0] === '') {
    let start = 1
    if (slices[start] === 'mnt') start += 1
    const disk = slices[start].toUpperCase() + ':'
    return [disk].concat(slices.slice(start + 1)).join(sep)
  }
  return directory
}

export async function getCwd(pid) {
  try {
    // TODO: no command supported on Windows
    if (process.platform === 'darwin') {
      const {stdout} = await exec(`lsof -p ${pid} | grep cwd`)
      return stdout.substring(stdout.indexOf('/'), stdout.length - 1)
    } else if (process.platform === 'linux') {
      return await fs.readlink(`/proc/${pid}/cwd`)
    }
  } catch {
    return ''
  }
}

const windowsCMDShells = ['cmd.exe']
// `git-cmd.exe --no-cd` has no title feature like windows built-in cmd.exe
// but invoke MinGW core when arguments `--command=usr/bin/bash.exe` specified
// TODO: judge title feature with both command and arguments
const windowsStandardShells = ['bash.exe', 'git-cmd.exe']

export function getWindowsProcessInfo(shell, title) {
  shell = basename(shell)
  if (windowsCMDShells.includes(shell)) {
    let program = basename(title)
    const separator = ' - '
    const index = program.indexOf(separator)
    if (index !== -1) {
      program = program.slice(index + separator.length)
    }
    return {process: program}
  } else if (windowsStandardShells.includes(shell)) {
    const separator = title.startsWith('MINGW') ? ':' : ': '
    const index = title.indexOf(separator)
    if (index !== -1) {
      const cwd = title.slice(index + separator.length)
      return {cwd: resolveWindowsDisk(cwd)}
    }
  }
  return null
}

const host = hostname()
const shorthost = host.split('.')[0]
const user = userInfo().username

export function getPrompt(expr, tab) {
  return expr
    .replace(/\\h/g, shorthost)
    .replace(/\\H/g, host)
    .replace(/\\l/g, tab ? tab.id : '')
    .replace(/\\u/g, user)
    .replace(/\\v/g, tab ? tab.process : '')
    .replace(/\\w/g, tab ? () => omitHome(tab.cwd) : '')
    .replace(/\\W/g, tab ? () => basename(tab.cwd) : '')
}

const iconset = icons.map(icon => {
  if (icon.pattern) {
    try {
      icon.pattern = new RegExp(icon.pattern)
    } catch {
      icon.pattern = null
    }
  }
  return icon
})

export function getIcon(process) {
  let name = process.toLowerCase()
  // strip extname in process name (Windows only)
  const point = name.lastIndexOf('.')
  if (point !== -1) name = name.slice(0, point)
  return iconset.find(icon => {
    if (icon.pattern) return new RegExp(icon.pattern).test(name)
    return icon.context.includes(name)
  })
}

export async function getGitBranch(directory) {
  const command = process.platform === 'win32' ?
    'git rev-parse --abbrev-ref HEAD 2> NUL' :
    'git branch 2> /dev/null | grep \\* | cut -d " " -f2'
  try {
    const {stdout} = await exec(command, {cwd: resolveHome(directory)})
    return stdout
  } catch {
    // Git for Windows will throw error if the directory is not a repository
    return ''
  }
}

export async function getMacOSCurrentNetworkService() {
  const networkInterface = 'route get default | grep interface | awk \'{print $2}\''
  const pipes = [
    'networksetup -listnetworkserviceorder',
    `grep -C1 $(${networkInterface})`,
    // 'awk "FNR == 1{print $2}"'
    'head -n 1 | cut -d " " -f2-',
  ]
  const {stdout} = await exec(pipes.join(' | '))
  return stdout.trim()
}

export async function getGlobalWebProxy() {
  if (process.platform !== 'darwin') return
  const service = await getMacOSCurrentNetworkService()
  if (!service) return
  const {stdout} = await exec(`networksetup -getwebproxy "${service}"`)
  return stdout.trim().split('\n').reduce((result, line) => {
    const [key, value] = line.split(': ')
    result[key.trim()] = value.trim()
    return result
  }, {})
}

export async function setGlobalWebProxy(options) {
  if (process.platform !== 'darwin') return
  const service = await getMacOSCurrentNetworkService()
  if (!service) return
  const {host, port} = {host: '""', port: 0, ...options}
  const args = [host, port].join(' ')
  const commands = [
    `networksetup -setwebproxy "${service}" ${args}`,
    `networksetup -setsecurewebproxy "${service}" ${args}`,
  ]
  if (!options) {
    commands.push(
      `networksetup -setwebproxystate "${service}" off`,
      `networksetup -setsecurewebproxystate "${service}" off`,
    )
  }
  return exec(commands.join(' && '))
}

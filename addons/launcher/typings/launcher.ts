import type { TerminalProfile } from '../../../src/typings/settings'

export interface LauncherInfo {
  name: string,
  command: string,
  directory?: string,
  login?: boolean,
  remote?: string,
  explorer?: string,
  profile?: TerminalProfile,
  tags?: string[],
  scripts?: LauncherInfo[],
}


export interface Launcher extends LauncherInfo {
  id: string,
  tags?: string[],
}


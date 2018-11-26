import {readFile, readFileSync, writeFile, mkdir, access} from 'fs'
import {dirname, resolve} from 'path'
import {promisify} from 'util'
import {remote} from 'electron'
import * as JSON from 'json5'

const promises = {
  readFile: promisify(readFile),
  access: promisify(access),
  mkdir: promisify(mkdir),
  writeFile: promisify(writeFile),
}

const PATH = process.env.NODE_ENV === 'production' ?
  remote.app.getPath('userData') : resolve(__dirname, '..', 'userdata')

export const FileStorage = {
  async load(basename) {
    try {
      return JSON.parse(await this.read(basename))
    } catch (e) {
      return null
    }
  },
  loadSync(basename) {
    try {
      return JSON.parse(this.readSync(basename))
    } catch (e) {
      return null
    }
  },
  async save(basename, data) {
    const filename = this.filename(basename)
    try {
      await promises.mkdir(dirname(filename))
    } catch (e) {}
    return promises.writeFile(filename, JSON.stringify(data, null, 2))
  },
  async read(basename) {
    try {
      return await promises.readFile(this.filename(basename))
    } catch (e) {
      return null
    }
  },
  readSync(basename) {
    try {
      return readFileSync(this.filename(basename))
    } catch (e) {
      return null
    }
  },
  require(basename) {
    const filename = this.filename(basename)
    try {
      return global.require(filename)
    } catch (e) {
      return null
    }
  },
  filename(basename) {
    return resolve(PATH, basename)
  },
}

export default {
  install(Vue, options) {
    Vue.prototype.$storage = FileStorage
  }
}

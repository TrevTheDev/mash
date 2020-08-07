import { FILE_TYPE_ENUMS } from '../../util/globals.js'
import { Path } from '../path.js'

import {
  mkdir, populateDirectory, cd, FindBuilder, chmod, chown, chgrp, rm,
} from '../../parsers/cmds.js'

const directoryMixin = (Base) => class extends Base {
  /**
   * @param {Path|string|Array<string>|Array<Path>|Array<Array>} nameArr
   * @param {boolean} ignoreAnyExistingDirectories
   * @returns {Directory|FsObjectArray}
   */
  async addDirectory(nameArr, ignoreAnyExistingDirectories = false) {
    await this._canonisePath()
    let nameArrMod
    if (nameArr.constructor.name === 'String') nameArrMod = new Path(nameArr).toArray()
    else if (nameArr.constructor.name === 'Path') nameArrMod = nameArr.toArray()
    else if (nameArr.constructor.name !== 'Array') throw new Error('invalid directory name(s)')
    else nameArrMod = nameArr

    const newDirs = await mkdir(this, nameArrMod, ignoreAnyExistingDirectories)
    return newDirs.length === 1 ? newDirs[0] : newDirs
  }

  /**
   * @returns {FILE_TYPE_ENUMS}
   */
  // eslint-disable-next-line class-methods-use-this
  get type() { return FILE_TYPE_ENUMS.directory }

  /**
   * @param {Path|string} name
   * @param {string} content
   * @param {boolean} overwrite
   * @returns {File}
   */
  async addFile(name, content = '', overwrite = false) {
    await this._canonisePath()
    const newFile = await this.u(name)
    await newFile.write(content, overwrite)
    return newFile
  }

  /**
   * @param {boolean} gio
   * @param {boolean} lsattr
   * @param {boolean} size
   * @param {boolean} recursively
   * @returns {FsObjectArray}
   */
  async dir(gio = true, lsattr = true, size = false, recursively = false) {
    await this._canonisePath()
    await populateDirectory(this, gio, lsattr, size)
    if (recursively) await this._pvt.content.loadAll(gio, lsattr, size)
    return this.content
  }

  /**
   * @returns {FsObjectArray}
   */
  get content() {
    return this._pvt.content ? this._pvt.content : this.dir()
  }

  /**
   * @returns {boolean}
   */
  async cd() {
    await this._canonisePath()
    return cd(this)
  }

  /**
   * @returns {FindBuilder}
   */
  get find() {
    return new FindBuilder(this)
  }

  /**
   * @param {string} permissions
   * @param {boolean} applyRecursively
   * @returns {Directory|DirectoryPromise|FsObject}
   */
  async setPermissions(permissions, applyRecursively = false) {
    await this._canonisePath()
    return chmod(this, permissions, applyRecursively)
  }

  /**
   * @param {User|string} user
   * @param {Group|string} group
   * @param {boolean} applyRecursively
   * @returns {Directory|DirectoryPromise|FsObject}
   */
  async setUser(user, group, applyRecursively = false) {
    if (!user) return this.setGroup(group, applyRecursively)
    await this._canonisePath()
    return chown(this, user, group, applyRecursively)
  }

  /**
   * @param {Group|string} group
   * @param {boolean} applyRecursively
   * @returns {Directory|DirectoryPromise|FsObject}
   */
  async setGroup(group, applyRecursively = false) {
    await this._canonisePath()
    return chgrp(this, `${group}`, applyRecursively)
  }

  /**
   * @param {boolean} recursive
   * @param {boolean} limitToThisDirsFileSystem
   * @param {boolean} onlyIfExists
   * @returns {boolean}
   */
  async delete(
    recursive = false,
    limitToThisDirsFileSystem = false,
    onlyIfExists = false,
  ) {
    await this._canonisePath()
    return rm(this, recursive, limitToThisDirsFileSystem, onlyIfExists)
  }
}
export default directoryMixin

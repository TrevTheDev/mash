import { FILE_TYPE_ENUMS } from '../../util/globals.js'
import { Path } from '../path.js'
import FsObjectCommon from './common.js'

import {
  mkdir, populateDirectory, cd, chmod, chown, chgrp, rm, FindBuilder,
} from '../../parsers/cmds.js'

export default class DirectoryBase extends FsObjectCommon {
  // eslint-disable-next-line class-methods-use-this
  get type() { return FILE_TYPE_ENUMS.directory }

  async addDirectory(nameArr, ignoreAnyExistingDirectories = false) {
    let nameArrMod
    if (nameArr.constructor.name === 'String') nameArrMod = new Path(nameArr).toArray()
    else if (nameArr.constructor.name === 'Path') nameArrMod = nameArr.toArray()
    else if (nameArr.constructor.name !== 'Array') throw new Error('invalid directory name(s)')
    else nameArrMod = nameArr

    const newDirs = await mkdir(this, nameArrMod, ignoreAnyExistingDirectories)
    return newDirs.length === 1 ? newDirs[0] : newDirs
  }

  async addFile(name, content = '', overwrite = false) {
    const newFile = await this.u(name)
    await newFile.write(content, overwrite)
    return newFile
  }

  async dir(gio = true, lsattr = true, size = false, recursively = false) {
    this._pvt.content = await populateDirectory(this, gio, lsattr, size)
    if (recursively) await this._pvt.content.loadAll(gio, lsattr, size)
    return this.content
  }

  setPermissions(permissions, applyRecursively = false) {
    return chmod(this, permissions, applyRecursively)
  }

  setUser(user, group, applyRecursively = false) {
    if (user) return chown(this, user, group, applyRecursively)
    return this.setGroup(group, applyRecursively)
  }

  setGroup(group, applyRecursively = false) {
    return chgrp(this, `${group}`, applyRecursively)
  }

  delete(
    recursive = false,
    limitToThisDirsFileSystem = false,
    onlyIfExists = false,
  ) {
    return rm(this, recursive, limitToThisDirsFileSystem, onlyIfExists)
  }

  cd() {
    return cd(this)
  }

  get content() {
    if (this._pvt.content) return this._pvt.content
    return this.dir()
  }

  get find() {
    return new FindBuilder(this)
  }

  toJSON(listing = false) {
    const json = super.toJSON()
    if (listing) json.content = this.content.toJSON()
    return json
  }
}

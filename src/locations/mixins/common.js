import { Path } from '../path.js'
import FsObjectBasic from './basics.js'

import {
  populateFsObject, matchAttrs, mv, touch, gioTrash, ln, CopyManager,
} from '../../parsers/cmds.js'

export default class FsObjectCommon extends FsObjectBasic {
  u(path) {
    return this.executionContext.getFsObjectPromise(`${this.path.addSegment(path)}`)
  }

  stat(gio = true, lsattr = true, size = false) {
    return populateFsObject(this, gio, lsattr, size)
  }

  copyTo(destinationDirectory, copyType, confirmOverwriteCallBack) {
    return new CopyManager(
      this,
      destinationDirectory,
      copyType,
      confirmOverwriteCallBack,
    )
  }

  moveTo(destinationDirectory, copyType, confirmOverwriteCallBack) {
    return new CopyManager(
      this,
      destinationDirectory,
      copyType,
      confirmOverwriteCallBack,
      true,
    )
  }

  cloneAttrs(sourceFSObject) {
    return matchAttrs(this, sourceFSObject)
  }

  rename(newName) {
    return mv(this, newName)
  }

  touch() {
    return touch(this)
  }

  trash() {
    return gioTrash(this)
  }

  linkTo(destination) {
    return ln(this, new Path(`${destination}`))
  }
}

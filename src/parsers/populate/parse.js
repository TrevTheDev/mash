/* eslint-disable no-param-reassign, no-tabs */
import { FILE_TYPE_ENUMS } from '../../util/globals.js'
import createStatObject from './stat.js'
import updateObjWithGioOutput from './gio.js'
import updateObjWithLsattrOutput from './lsattr.js'
import updateObjWithSizeOutput from './size.js'

/**
 * reads `directory` content and the returns stat'ed | gio'ed | lsattr'ed `FSObjectArray`
 * @param {ExecutionContext} executionContext - `directory` that should be read
 * @param {boolean} gio
 * @param {boolean} lsattr
 * @param {boolean} size
 * @param {string} fsObjString
 * @returns {File|Directory|Symlink}
 */
export default async (executionContext, gio, lsattr, size, fsObjString) => {
  // fsObj._transitionState('loading')
  const { server } = executionContext
  const [statOutput, gioOutput, lsattrOutput, sizeOutput] = fsObjString.split(server.config.cmdDivider)

  const newFsObject = createStatObject(statOutput, executionContext)
  if (gio) updateObjWithGioOutput(gioOutput, newFsObject)
  if (lsattr) updateObjWithLsattrOutput(lsattrOutput, newFsObject)
  if (newFsObject.type === FILE_TYPE_ENUMS.symbolicLink) {
    const pth = await newFsObject.paths.getSymlinkTargetPath()
    let linkTarget = newFsObject.executionContext.getFsObjectPromisePathed(`${pth}`)
    if (await linkTarget.exists) {
      linkTarget = await linkTarget.stat(gio, lsattr, size)
      if (linkTarget.type !== FILE_TYPE_ENUMS.symbolicLink) newFsObject._props.linkEndTarget = linkTarget
      else newFsObject._props.linkEndTarget = linkTarget._props.linkEndTarget
      newFsObject._props.linkTarget = linkTarget
    } else {
      newFsObject._props.linkEndTarget = undefined
      newFsObject._props.linkTarget = pth
    }
  }
  if (size && newFsObject.type === FILE_TYPE_ENUMS.directory) updateObjWithSizeOutput(sizeOutput, newFsObject)
  return newFsObject
}

/*
%a Access rights in octal 	%m
%b Number of blocks allocated (see %B) 	%b
%d Device number in decimal 	%D
%F File type 	%F
%g Group ID of owner 	%G
%G Group name of owner 	%g
%h Number of hard links	%n
%i Inode number	%i
%s Total size, in bytes 	%s
%t Major device type in hex
%T Minor device type in hex
%u User ID of owner 	%U
%U User name of owner 	%u
%W Time of file birth as seconds since Epoch, or ‘0’
%X Time of last access as seconds since Epoch 	%a
%Y Time of last data modification as seconds since Epoch 	%t
%Z Time of last status change as seconds since Epoch 	%c
%n File name 	%p
*/

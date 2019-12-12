/* eslint-disable no-param-reassign */
import {FILE_TYPE_ENUMS, LOCAL} from '../../util/globals'
import updateObjWithStatOutput from './stat'
import updateObjWithGioOutput from './gio'
import updateObjWithLsattrOutput from './lsattr'
import updateObjWithSizeOutput from './size'
import Permissions from '../../locations/permission'

export default async (fsObj, gio, lsattr, size, fsObjString) => {
  fsObj._transitionState('loading')
  const [statOutput, gioOutput, lsattrOutput, sizeOutput] = fsObjString.split(
    `${fsObj.executionContext.server.config.cmdDivider}`
  )

  fsObj._props = {}
  fsObj._permissions = new Permissions()

  updateObjWithStatOutput(statOutput, fsObj)
  if (gio) updateObjWithGioOutput(gioOutput, fsObj)
  if (lsattr) updateObjWithLsattrOutput(lsattrOutput, fsObj)
  if (fsObj._props.type === FILE_TYPE_ENUMS.symbolicLink) {
    const pth = await fsObj.paths.getSymlinkTargetPath()
    const linkTarget = fsObj.executionContext.getFSObjFromPath(pth)
    if (await linkTarget.exists) {
      await linkTarget.stat(gio, lsattr, size)
      if (linkTarget.type !== FILE_TYPE_ENUMS.symbolicLink)
        fsObj._props.linkEndTarget = linkTarget
      else fsObj._props.linkEndTarget = linkTarget._props.linkEndTarget
      fsObj._props.linkTarget = linkTarget
      fsObj._props.size = fsObj._props.linkTarget.size
    } else {
      fsObj._props.linkEndTarget = undefined
      fsObj._props.linkTarget = pth
      fsObj._props.size = undefined
      if (size) throw new Error(`stat: ${LOCAL.symlinkBroken}: ${fsObj}`)
    }
  }
  if (size && fsObj._props.type === FILE_TYPE_ENUMS.directory)
    updateObjWithSizeOutput(sizeOutput, fsObj)

  fsObj._changeToType(fsObj._props.type)
  fsObj._transitionState('loaded')
  return fsObj
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

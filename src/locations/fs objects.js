import {
  FsObject,
  DirectoryPromise,
  FilePromise,
  BlockDevicePromise,
  CharacterDevicePromise,
  LocalSocketPromise,
  NamedPipePromise,
  SymlinkPromise,
} from './mixins/fs object promises.js'

import {
  Directory, File, BlockDevice, CharacterDevice, LocalSocket, NamedPipe, Symlink,
} from './mixins/fs objects.js'

import FsObjectArray from './fs object array.js'

import { glob } from '../util/globals.js'

// export const fsObjectFromStatType = (statFileType) => {
//   switch (statFileType) {
//     case 'regular empty file':
//     case 'regular file':
//       return File
//     case 'directory':
//       return Directory
//     case 'symbolic link':
//       return Symlink
//     case 'character special file':
//       return CharacterDevice
//     case 'block device':
//       return BlockDevice
//     case 'socket':
//       return LocalSocket
//     case 'fifo':
//       return NamedPipe
//     default:
//       throw new Error('state: unknown file type')
//   }
// }

glob.fsObjectsByType = {
  FsObject,

  FsObjectArray,

  File,
  Directory,
  CharacterDevice,
  Symlink,
  BlockDevice,
  LocalSocket,
  NamedPipe,
  'regular empty file': File,
  'regular file': File,
  directory: Directory,
  'symbolic link': Symlink,
  'character special file': CharacterDevice,
  'block device': BlockDevice,
  socket: LocalSocket,
  fifo: NamedPipe,
  // changeFsObjectToType: (fsObject, type) => {
  //   if (![undefined, 'loading'].includes(fsObject.state)) throw new Error('wrong state')
  //   const newFsObjBase = new this[type](
  //     fsObject.executionContext,
  //     fsObject.path, false,
  //   )
  //   delete newFsObjBase._events
  //   newFsObjBase._createAutomationFunctions = fsObject._createAutomationFunctions
  //   Object.setPrototypeOf(this, newFsObjBase)
  // },
}

export {
  FsObject,

  File,
  Directory,
  Symlink,
  BlockDevice,
  CharacterDevice,
  LocalSocket,
  NamedPipe,

  FilePromise,
  DirectoryPromise,
  SymlinkPromise,
  BlockDevicePromise,
  CharacterDevicePromise,
  LocalSocketPromise,
  NamedPipePromise,

  FsObjectArray,
}

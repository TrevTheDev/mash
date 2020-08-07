/* eslint-disable max-classes-per-file, class-methods-use-this */
import FsObjectCommon from './common.js'
import directoryMixin from './directory base.js'
import fileMixin from './file base.js'
import symlinkMixin from './symlink base.js'

// noinspection JSCheckFunctionSignatures
const fsObjectBasePromiseMixin = (Base) => class extends Base {
  get permissions() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.permissions)
      })()
    })
  }

  get group() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.group)
      })()
    })
  }

  get user() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.user)
      })()
    })
  }

  get accessRights() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.accessRights)
      })()
    })
  }

  get size() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.size)
      })()
    })
  }

  get blocksAllocated() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.blocksAllocated)
      })()
    })
  }

  get deviceNumber() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.deviceNumber)
      })()
    })
  }

  get numberHardLinks() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.numberHardLinks)
      })()
    })
  }

  get inode() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.inode)
      })()
    })
  }

  get majorDeviceType() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.majorDeviceType)
      })()
    })
  }

  get minorDeviceType() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.minorDeviceType)
      })()
    })
  }

  get timeOfBirth() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.timeOfBirth)
      })()
    })
  }

  get timeOfLastAccess() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.timeOfLastAccess)
      })()
    })
  }

  get timeOfLastModification() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.timeOfLastModification)
      })()
    })
  }

  get timeOfLastMetaDataChange() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.timeOfLastMetaDataChange)
      })()
    })
  }

  get timeOfLastAccessMicroSec() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.timeOfLastAccessMicroSec)
      })()
    })
  }

  get timeOfLastModificationMicroSec() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.timeOfLastModificationMicroSec)
      })()
    })
  }

  get timeOfLastMetaDataChangeMicroSec() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.timeOfLastMetaDataChangeMicroSec)
      })()
    })
  }

  get contentType() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.contentType)
      })()
    })
  }

  get fastContentType() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.fastContentType)
      })()
    })
  }

  get uri() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.uri)
      })()
    })
  }

  get icon() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.icon)
      })()
    })
  }

  get symbolicIcon() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.symbolicIcon)
      })()
    })
  }

  get etagValue() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.etagValue)
      })()
    })
  }

  get fileId() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.fileId)
      })()
    })
  }

  get mode() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.mode)
      })()
    })
  }

  get rdev() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.rdev)
      })()
    })
  }

  get lsattr() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.lsattr)
      })()
    })
  }

  loadedStat = false

  loadedGio = false

  loadedLsattr = false

  loadedSize = false

  loadedContent = false

  get type() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.type)
      })()
    })
  }

  then(...thenArgs) {
    (async () => {
      await this._canonisePath()
      this.then = undefined
      thenArgs[0](this)
    })()
  }
}

// const directoryPromiseMixin = (Base) => class extends fsObjectBasePromiseMixin(Base) {
//   // get content() {
//   //   return new Promise((result) => {
//   //     (async () => {
//   //       const fsObject = await this.stat()
//   //       result(fsObject.content)
//   //     })()
//   //   })
//   // }
// }

const simlinkPromiseMixin = (Base) => class extends fsObjectBasePromiseMixin(Base) {
  get linkTarget() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.linkTarget)
      })()
    })
  }

  get linkEndTarget() {
    return new Promise((result) => {
      (async () => {
        const fsObject = await this.stat()
        result(fsObject.linkEndTarget)
      })()
    })
  }
}

export class FsObject extends simlinkPromiseMixin(directoryMixin(fileMixin(symlinkMixin(FsObjectCommon)))) {}
export class DirectoryPromise extends fsObjectBasePromiseMixin(directoryMixin(FsObjectCommon)) {
}
export class FilePromise extends fsObjectBasePromiseMixin(fileMixin(FsObjectCommon)) {}
export class BlockDevicePromise extends FilePromise {}
export class CharacterDevicePromise extends FilePromise {}
export class LocalSocketPromise extends FilePromise {}
export class NamedPipePromise extends FilePromise {}
export class SymlinkPromise extends simlinkPromiseMixin(directoryMixin(fileMixin(symlinkMixin(FsObjectCommon)))) {}

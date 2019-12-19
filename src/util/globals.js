// const fsPromises = require('fs').promises
// import {promises as fsPromises} from 'fs'
import initScript from '../parsers/init.js'
/* REGIONALISATION
 ******************************************************************************************************
 */
export const LOCAL = {
  pathNotFound: 'path not found',
  directoryNotFound: 'directory not found',
  requiredCmdNotFound: 'required command not found',
  optionalCmdNotFound: 'optional command not found',
  invalidFileURI: 'invalid file URI',
  strangePathFound: 'a path containing strange characters was found',
  propertyNotFound: 'this property was not found:',
  invalidDirectoryName: 'invalid directory name',
  fsObjAlreadyExists: 'path already exists',
  directoryNotEmpty: 'directory not empty',
  unableToMkdir: 'unable to create new directory, check permissions',
  noFileOnRM: 'file or directory not found (check existence or permissions)',
  permissionDenied: 'permission denied',
  cancelledByUser: 'cancelled by user',
  dirExpected: 'directory expected got',
  fileExpected: 'file expected got',
  invalidArgument: 'invalid argument',
  invalidName: 'invalid name or path',
  renameFailed: 'rename failed - name may already be in use',
  noSuchUser: 'user not found',
  unexpectedError: 'an expected error has occurred',
  pathTypeNotSupported: 'path type not supported',
  symlinkBroken: 'symlink broken',
  destNotADir: 'destinationDirectory is not a directory'
}

/* ENUMS
 ******************************************************************************************************
 */

class EnumKey {
  constructor(props) {
    Object.freeze(Object.assign(this, props))
  }

  toString() {
    return this.name
  }

  toJSON() {
    return this.name
  }
}

class Enum {
  constructor(...keys) {
    keys.forEach((key, index) => {
      Object.defineProperty(this, key, {
        value: new EnumKey({
          name: key,
          index
        }),
        enumerable: true
      })
    })
    Object.freeze(this)
  }

  *[Symbol.iterator]() {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(this)) {
      yield this[key]
    }
  }

  toString() {
    return [...this].join(', ')
  }
}

/* ENUMS - START
 ******************************************************************************************************
 */

/**
 * Enum for posix file types.
 * @readonly
 * @enum {number} based on position
 */
export const FILE_TYPE_ENUMS = new Enum(
  'file',
  'directory',
  'symbolicLink',
  'characterDevice',
  'blockDevice',
  'localSocket',
  'namedPipe'
)

// export const MV_TYPE = new Enum(
//   'overwrite',
//   'overwriteOlderDontAsk',
//   'overwriteOlderAsk',
//   'askBeforeOverwrite',
//   'doNotOverwrite'
// )

export const CP_TYPE = new Enum(
  'overwrite',
  'overwriteOlder',
  'askBeforeOverwrite',
  'doNotOverwrite'
)

/* globalOptions
 ******************************************************************************************************
 */
export const DEFAULT_CONFIG = {
  server: {
    cmdDivider: '___EOC___',
    fileDivider: '___EOG___',
    log: true
  },

  executionContext: {
    createAutomationFunctions: true
  },

  shell: {
    initScript,
    sudoWait: 50
  },

  logger: {
    console: {
      info: false,
      debug: false,
      error: false
    },
    file: {
      info: './logs/info.log',
      debug: './logs/debug.log',
      error: './logs/error.log'
    }
  }
}

// class Glob {
//   constructor() {
//     if (Glob.instance) return Glob.instance
//   }
// }

export const glob = {}

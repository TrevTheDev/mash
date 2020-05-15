/* eslint-disable max-classes-per-file */
// const fsPromises = require('fs').promises
// import {promises as fsPromises} from 'fs'
import initScript from '../parsers/init.js'
/* REGIONALIZATION
 ******************************************************************************************************
 */
export const LOCAL = Object.freeze({
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
})

/* ENUMS - START
 ******************************************************************************************************
 */

// export const MV_TYPE = new Enum(
//   'overwrite',
//   'overwriteOlderDontAsk',
//   'overwriteOlderAsk',
//   'askBeforeOverwrite',
//   'doNotOverwrite'
// )

/**
 * Enum for posix file types.
 * @readonly
 * @enum {number} based on position
 */
export const FILE_TYPE_ENUMS = Object.freeze({
  file: 'file',
  directory: 'directory',
  symbolicLink: 'symbolicLink',
  characterDevice: 'characterDevice',
  blockDevice: 'blockDevice',
  localSocket: 'localSocket',
  namedPipe: 'namedPipe'
})

export const CP_TYPE = Object.freeze({
  overwrite: 'overwrite',
  overwriteOlder: 'overwriteOlder',
  askBeforeOverwrite: 'askBeforeOverwrite',
  doNotOverwrite: 'doNotOverwrite'
})

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

export const glob = {}

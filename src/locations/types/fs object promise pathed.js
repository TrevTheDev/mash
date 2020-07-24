/* eslint-disable no-eval, no-unused-vars */
import { FILE_TYPE_ENUMS } from '../../util/globals.js'
import FileBase from '../mixins/file base.js'
import DirectoryBase from '../mixins/directory base.js'
import { baseStatPropertyPromises, symlinkStatPropertyPromises } from '../mixins/property builders.js'
import { Path } from '../path.js'
import {
  mkdir, populateDirectory, cd, chmod, chown, chgrp, rm, FindBuilder,
} from '../../parsers/cmds.js'

const clsString = `(${DirectoryBase
  .toString()
  .replace('DirectoryBase extends FsObjectCommon', 'PathedFsObjectPromiseBase extends FileBase')
  .slice(0, -1)}${baseStatPropertyPromises}${symlinkStatPropertyPromises}
})`

const FsObjectPromisePathed = eval(clsString)
export default FsObjectPromisePathed

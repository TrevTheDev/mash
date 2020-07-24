/* eslint-disable no-unused-vars, no-eval */
import { FILE_TYPE_ENUMS } from '../../util/globals.js'

import FileBase from './file base.js'
import DirectoryBase from './directory base.js'
import FsObjectCommon from './common.js'

import { Path } from '../path.js'

import {
  mkdir, populateDirectory, cd, FindBuilder, chmod, chown, chgrp, rm,
} from '../../parsers/cmds.js'

const clsString = DirectoryBase
  .toString()
  .replace('DirectoryBase extends FsObjectCommon', 'SymlinkBase extends FileBase')

const SymlinkBase = eval(`(${clsString})`)
export default SymlinkBase

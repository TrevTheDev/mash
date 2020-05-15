/* eslint-disable no-param-reassign */
import {LOCAL, glob} from '../util/globals.js'
/**
 * @param {FsObject} fsObject
 * @param {boolean} recursive
 * @param {boolean} limitToCWDFilesystem
 * @param {boolean} onlyIfExists
 * @returns
 */
const rm = async (fsObject, recursive, limitToCWDFilesystem, onlyIfExists) => {
  if (onlyIfExists) if (!(await fsObject.exists)) return false
  const rmSh = await fsObject.sh(
    `rm -d${recursive ? ' -r' : ''}${
      limitToCWDFilesystem ? ' --one-file-system' : ''
    } -- ${fsObject.toSh()};`,
    'rm'
  )
  if (rmSh.error) {
    let msg
    if (rmSh.output.includes('Directory not empty'))
      msg = `${LOCAL.directoryNotEmpty}: rm: ${fsObject}`
    else if (rmSh.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: rm: ${fsObject}`
    else if (rmSh.output.includes('No such file or directory'))
      msg = `${LOCAL.noFileOnRM}: rm: ${fsObject}`
    else msg = `${rmSh.output}: rm: ${fsObject}`
    if (glob.logger) glob.logger.error(msg, 'rm')
    throw new Error(msg)
  }
  Object.keys(fsObject).forEach(prop => {
    Reflect.deleteProperty(fsObject, prop)
  })
  Object.setPrototypeOf(fsObject, {})
  fsObject.deleted = true
  return true
}

export default rm

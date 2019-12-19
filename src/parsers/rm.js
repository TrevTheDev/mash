/* eslint-disable no-param-reassign */
import {LOCAL, glob} from '../util/globals.js'
/**
 * mkdir - see `addDirectory`
 * TODO: check what happens if person tries to delete /
 * TODO: check what happens if insufficient permissions
 * @param {string} path
 * @param {boolean} deleteIfNotEmpty
 * @param {boolean} limitToCWDFilesystem
 * @returns
 */
export default async (
  fsObject,
  recursive,
  limitToCWDFilesystem,
  onlyIfExists
) => {
  if (onlyIfExists) if (!(await fsObject.exists)) return false
  const rm = await fsObject.sh(
    `rm -d${recursive ? ' -r' : ''}${
      limitToCWDFilesystem ? ' --one-file-system' : ''
    } -- ${fsObject.toSh()};`,
    'rm'
  )
  if (rm.error) {
    let msg
    if (rm.output.includes('Directory not empty'))
      msg = `${LOCAL.directoryNotEmpty}: rm: ${fsObject}`
    else if (rm.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: rm: ${fsObject}`
    else if (rm.output.includes('wrong password'))
      msg = `${LOCAL.wrongPassword}: rm: ${fsObject}`
    else if (rm.output.includes('No such file or directory'))
      msg = `${LOCAL.noFileOnRM}: rm: ${fsObject}`
    else msg = `${rm.output}: rm: ${fsObject}`
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

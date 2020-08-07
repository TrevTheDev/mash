import { LOCAL, glob } from '../util/globals.js'
import { pwd } from './pwd.js'

/**
 * @param {Directory|DirectoryPromise|FsObject} directory
 * @returns {DirectoryPromise}
 */
export const cd = async (directory) => {
  const cmd = await directory.sh(
    `cd -- ${directory.toSh()};`,
    undefined,
    undefined,
    true,
  )
  if (cmd.error) {
    let msg
    if (cmd.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: cd: ${directory}`
    else if (cmd.output.includes('no such file or directory')) msg = `${LOCAL.directoryNotFound}: cd: ${directory}`
    else msg = `cd: ${cmd.output}`
    if (glob.logger) glob.logger.error(msg, 'cd')
    throw new Error(msg)
  }
  return pwd(directory.executionContext)
}

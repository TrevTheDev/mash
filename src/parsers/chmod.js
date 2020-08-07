import { LOCAL, glob } from '../util/globals.js'
/**
 * chmod - modifies fsObject permissions
 * TODO: check what happens if person tries to delete /
 * TODO: check what happens if insufficient permissions
 * @param {Directory|DirectoryPromise|File|FilePromise|FsObject} fsObject
 * @param {string} permissions - string of permission '777' or 'a+w'
 * @param {boolean} recursive - apply permissions recursively
 * @returns {Directory|DirectoryPromise|File|FilePromise|FsObject} fsObject - but state will be outdated
 */
export const chmod = async (fsObject, permissions, recursive) => {
  const chmodSh = await fsObject.sh(
    `chmod ${permissions} ${recursive ? '-R ' : ''}-- ${fsObject.toSh()};`,
    'chmod',
  )
  if (chmodSh.error) {
    let msg
    if (chmodSh.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: chmod: ${fsObject}`
    else msg = `chmod: ${chmodSh.output}`
    if (glob.logger) glob.logger.error(msg, 'chmod')
    throw new Error(msg)
  }
  fsObject.markAsInvalid()
  return fsObject
}

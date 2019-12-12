import {LOCAL, glob} from '../util/globals'
/**
 * mkdir - see `addDirectory`
 * TODO: check what happens if person tries to delete /
 * TODO: check what happens if insuffieicent permissions
 * @param {string} path
 * @param {boolean} requireDirectoryToBeEmpty
 * @param {boolean} limitToCWDFilesystem
 * @returns
 */
export default async (FSObject, user, group, recursive) => {
  const chown = await FSObject.sh(
    `chown${recursive ? ' -R' : ''} ${user}${
      group ? `:${group}` : ''
    } -- ${FSObject.toSh()};`,
    'chown'
  )
  if (chown.error) {
    let msg
    if (chown.output.includes('Operation not permitted'))
      msg = `${LOCAL.permissionDenied}: chown: ${FSObject}`
    else msg = `chown: ${chown.output}`
    if (glob.logger) glob.logger.error(msg, 'chown')
    throw new Error(msg)
  }
  if (FSObject.state === 'loaded') FSObject._transitionState('outdated')
  return FSObject
}

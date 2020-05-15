import {LOCAL, glob} from '../util/globals.js'
/**
 * mkdir - see `addDirectory`
 * TODO: check what happens if person tries to delete /
 * TODO: check what happens if insufficient permissions
 * @param {FsObject} fsObject
 * @param {String|String} user
 * @param {String|String} group
 * @param {Boolean} recursive
 * @returns
 */
const chown = async (fsObject, user, group, recursive) => {
  const chownSh = await fsObject.sh(
    `chown${recursive ? ' -R' : ''} ${user}${
      group ? `:${group}` : ''
    } -- ${fsObject.toSh()};`,
    'chown'
  )
  if (chownSh.error) {
    let msg
    if (chownSh.output.includes('Operation not permitted'))
      msg = `${LOCAL.permissionDenied}: chown: ${fsObject}`
    else msg = `chown: ${chownSh.output}`
    if (glob.logger) glob.logger.error(msg, 'chown')
    throw new Error(msg)
  }
  if (fsObject.state === 'loaded') fsObject._transitionState('outdated')
  return fsObject
}
export default chown

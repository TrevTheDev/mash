import {LOCAL, glob} from '../util/globals.js'
/**
 * mkdir - see `addDirectory`
 * TODO: check what happens if person tries to delete /
 * TODO: check what happens if insufficient permissions
 * @param {string} path
 * @param {boolean} requireDirectoryToBeEmpty
 * @param {boolean} limitToCWDFilesystem
 * @returns
 */
export default async (FSObject, permissions, recursive) => {
  const chmod = await FSObject.sh(
    `chmod ${permissions} ${recursive ? '-R ' : ''}-- ${FSObject.toSh()};`,
    'chmod'
  )
  if (chmod.error) {
    let msg
    if (chmod.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: chmod: ${FSObject}`
    else msg = `chmod: ${chmod.output}`
    if (glob.logger) glob.logger.error(msg, 'chmod')
    throw new Error(msg)
  }
  if (FSObject.state === 'loaded') FSObject._transitionState('outdated')
  return FSObject
}

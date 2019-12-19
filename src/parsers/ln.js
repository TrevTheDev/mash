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
export default async (FSObject, destination) => {
  const ln = await FSObject.sh(
    // `ln -Tsn -- ${destination.toSh()} ${FSObject.toSh()};`,
    `if [ -L ${FSObject.toSh()} ]; then ln -Tfsn -- ${destination.toSh()} ${FSObject.toSh()}; else ln -Tsn -- ${destination.toSh()} ${FSObject.toSh()}; fi;`,
    'ln'
  )
  if (ln.error) {
    let msg
    if (ln.output.includes('File exists'))
      msg = `ln: ${LOCAL.fsObjAlreadyExists}: ${FSObject}`
    else if (ln.output.includes('Operation not permitted'))
      msg = `ln: ${LOCAL.permissionDenied}: ${FSObject}`
    else msg = `ln: ${ln.output}`
    if (glob.logger) glob.logger.error(msg, 'ln')
    throw new Error(msg)
  }

  const newSymlink = await FSObject.executionContext.getSymlinkFromPath(
    `${FSObject}`
  )

  if (FSObject.state === 'loaded') FSObject._transitionState('outdated')

  return newSymlink
}

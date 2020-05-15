import {LOCAL, glob} from '../util/globals.js'
/**
 * @param {FsObject} fsObject
 * @param {Path|String|FsObject} destination
 * @returns
 */
const ln = async (fsObject, destination) => {
  const lnSh = await fsObject.sh(
    // `ln -Tsn -- ${destination.toSh()} ${FSObject.toSh()};`,
    `if [ -L ${fsObject.toSh()} ]; then ln -Tfsn -- ${destination.toSh()} ${fsObject.toSh()}; else ln -Tsn -- ${destination.toSh()} ${fsObject.toSh()}; fi;`,
    'ln'
  )
  if (lnSh.error) {
    let msg
    if (lnSh.output.includes('File exists'))
      msg = `ln: ${LOCAL.fsObjAlreadyExists}: ${fsObject}`
    else if (lnSh.output.includes('Operation not permitted'))
      msg = `ln: ${LOCAL.permissionDenied}: ${fsObject}`
    else msg = `ln: ${lnSh.output}`
    if (glob.logger) glob.logger.error(msg, 'ln')
    throw new Error(msg)
  }

  const newSymlink = await fsObject.executionContext.getSymlinkFromPath(
    `${fsObject}`
  )

  if (fsObject.state === 'loaded') fsObject._transitionState('outdated')

  return newSymlink
}
export default ln

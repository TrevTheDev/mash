import { LOCAL, glob } from '../../util/globals.js'
import parse from './parse.js'

/**
 * queries `fsObj` and the returns stat'ed | gio'ed | lsattr'ed  | size of relevant `FSObject`
 * @param {FsObjectCommon} fsObject - `FsObject` that should be queried
 * @param {boolean=true} gio - whether `fsObj` should be populated with gio information
 * @param {boolean=true} lsattr - whether `fsObj` should be populated with lsattr information
 * @param {boolean=true} size - whether `fsObj` should calculate the size of directories
 * @returns relevant populated `fsObj`
 */
export const populateFsObject = async (fsObject, gio = true, lsattr = true, size = false) => {
  const queryFileResults = await fsObject.sh(
    `inspectFSObj ${gio ? 1 : 0} ${lsattr ? 1 : 0} ${size ? 1 : 0} ${fsObject.toSh()};`,
  )

  if (queryFileResults.error) {
    let errMsg
    if (queryFileResults.output.includes('Permission denied')) errMsg = `stat: ${LOCAL.permissionDenied}: ${fsObject}`
    else if (queryFileResults.output.includes('No such file or directory')) errMsg = `stat: ${LOCAL.pathNotFound}: ${fsObject}`
    else errMsg = `stat: ${queryFileResults.output}: ${fsObject}`
    if (glob.logger) glob.logger.error(errMsg, 'populateFSObject')
    throw new Error(errMsg)
  }
  return parse(
    fsObject.executionContext,
    gio,
    lsattr,
    size,
    queryFileResults.output.split(fsObject.executionContext.server.config.fileDivider)[0],
  )
}

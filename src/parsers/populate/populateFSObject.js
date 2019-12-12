import {LOCAL, glob} from '../../util/globals'
import parse from './parse'

/**
 * queries `fsObj` and the returns stat'ed | gio'ed | lsattr'ed relevant `FSObject`
 * @param {FSObject} fsObj - `FSObject` that should be read
 * @param {boolean=true} gio - whether `FSObject` should be populated with gio information
 * @param {boolean=true} lsattr - whether `FSObject` should be populated with lsattr information
 * @returns relevant populated `FSObject`
 */
export default async (fsObj, gio = true, lsattr = true, size = false) => {
  const queryFileResults = await fsObj.sh(
    `inspectFSObj ${gio ? 1 : 0} ${lsattr ? 1 : 0} ${
      size ? 1 : 0
    } ${fsObj.toSh()};`
  )

  if (queryFileResults.error) {
    let errMsg
    if (queryFileResults.output.includes('Permission denied'))
      errMsg = `stat: ${LOCAL.permissionDenied}: ${fsObj}`
    else if (queryFileResults.output.includes('No such file or directory'))
      errMsg = `stat: ${LOCAL.pathNotFound}: ${fsObj}`
    else errMsg = `stat: ${queryFileResults.output}: ${fsObj}`
    if (glob.logger) glob.logger.error(errMsg, 'populateFSObject')
    throw new Error(errMsg)
  }
  return parse(
    fsObj,
    gio,
    lsattr,
    size,
    queryFileResults.output.split(
      `${fsObj.executionContext.server.config.fileDivider}`
    )[0]
  )
}

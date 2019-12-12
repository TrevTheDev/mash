/* eslint-disable no-param-reassign */
// import FSObjectArray from '../../locations/fs object array'
import {LOCAL, glob} from '../../util/globals'
import parse from './parse'

/**
 * reads `directory` content and the returns stat'ed | gio'ed | lsattr'ed `FSObjectArray`
 * @param {object} directory - `directory` that should be read
 * @param {boolean=true} gio - whether `FSObjects` should be populated with gio information
 * @param {boolean=true} lsattr - whether `FSObjects` should be populated with lsattr information
 * @returns FSObjectArray - of `directory`'s content
 */
export default async (directory, gio = true, lsattr = true, size = false) => {
  directory.loadedContent = false

  const ls = await directory.sh(
    `inspectDir ${gio ? 1 : 0} ${lsattr ? 1 : 0} ${
      size ? 1 : 0
    } ${directory.toSh()};`
  )

  if (ls.error) {
    let errMsg
    if (ls.output.includes('Permission denied'))
      errMsg = `stat: ${LOCAL.permissionDenied}: ${directory}`
    else if (ls.output.includes('directory not found'))
      errMsg = `stat: ${LOCAL.directoryNotFound}: ${directory}`
    else errMsg = `stat: ${ls.output}: ${directory}`
    if (glob.logger) glob.logger.error(errMsg, 'populateDirectory')
    throw new Error(errMsg)
  }

  const fsObjArr = new glob.FSObjectArray()
  const pms = ls.output
    .split(`${directory.executionContext.server.config.fileDivider}`)
    .slice(0, -1)
    .map(fileTxt => {
      const fsObj = new glob.FsObject(directory.executionContext)
      fsObj._pvt.parent = directory
      fsObj._transitionState('loadable')
      return parse(fsObj, gio, lsattr, size, fileTxt)
    })
  const res = await Promise.all(pms)

  fsObjArr.push(...res)

  directory._pvt.content = fsObjArr
  directory.loadedContent = true
  return fsObjArr
}

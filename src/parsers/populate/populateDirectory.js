/* eslint-disable no-param-reassign */
// import FSObjectArray from '../../locations/fs object array'
import { LOCAL, glob } from '../../util/globals.js'
import parse from './parse.js'

/**
 * reads `directory` content and the returns stat'ed | gio'ed | lsattr'ed `FSObjectArray`
 * @param {Directory|DirectoryPromise|FsObject} directory - `directory` that should be read
 * @param {boolean} gio - whether `FSObjects` should be populated with gio information
 * @param {boolean} lsattr - whether `FSObjects` should be populated with lsattr information
 * @param {boolean} size - whether `FSObjects` should calculate the size of directories
 * @returns {Directory} with content loaded
 */
export const populateDirectory = async (directory, gio = true, lsattr = true, size = false) => {
  directory.loadedContent = false

  const ls = await directory.sh(`inspectDir ${gio ? 1 : 0} ${lsattr ? 1 : 0} ${size ? 1 : 0} ${directory.toSh()};`)

  if (ls.error) {
    let errMsg
    if (ls.output.includes('Permission denied')) errMsg = `stat: ${LOCAL.permissionDenied}: ${directory}`
    else if (ls.output.includes('directory not found')) errMsg = `stat: ${LOCAL.directoryNotFound}: ${directory}`
    else errMsg = `stat: ${ls.output}: ${directory}`
    if (glob.logger) glob.logger.error(errMsg, 'populateDirectory')
    throw new Error(errMsg)
  }

  const fsObjArr = new glob.fsObjectsByType.FsObjectArray()
  const pms = ls.output
    .split(`${directory.executionContext.server.config.fileDivider}`)
    .slice(0, -1)
    .map(async (fileTxt) => {
      const fsObj = await parse(directory.executionContext, gio, lsattr, size, fileTxt)
      fsObj._pvt.parent = directory
      return fsObj
    })
  const res = await Promise.all(pms)

  fsObjArr.push(...res)

  directory._pvt.content = fsObjArr
  directory.loadedContent = true
  return directory
}

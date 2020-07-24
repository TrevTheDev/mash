import { LOCAL, glob } from '../../util/globals.js'

const find = async (directory, cmdString) => {
  const cmd = await directory.sh(cmdString, 'find')

  if (cmd.error) {
    let msg
    if (cmd.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: find: ${directory}`
    else msg = `find: ${cmd.output}: ${directory}`
    if (glob.logger) glob.logger.error(msg, 'find')
    throw new Error(msg)
  }

  const fsObjArr = new glob.fsObjectsByType.FsObjectArray()
  const pms = cmd.output
    .split('\0')
    .slice(0, -1)
    .map((path) => {
      const fsObj = directory.executionContext.getFsObjectPromisePathed(path)
      // fsObj._transitionState('loadable')
      return fsObj.stat()
    })
  const res = await Promise.all(pms)

  fsObjArr.push(...res)

  return fsObjArr
}
export default find

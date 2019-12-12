import {LOCAL, glob} from '../util/globals'

export default async (directory, cmdString) => {
  const find = await directory.sh(cmdString, 'find')

  if (find.error) {
    let msg
    if (find.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: find: ${directory}`
    else msg = `find: ${find.output}: ${directory}`
    if (glob.logger) glob.logger.error(msg, 'find')
    throw new Error(msg)
  }

  const fsObjArr = new glob.FSObjectArray()
  const pms = find.output
    .split(`\0`)
    .slice(0, -1)
    .map(path => {
      const fsObj = directory.executionContext.getFsObjectFromPath(path)
      fsObj._transitionState('loadable')
      return fsObj.stat()
    })
  const res = await Promise.all(pms)

  fsObjArr.push(...res)

  return fsObjArr
}

import { LOCAL, glob } from '../util/globals.js'

export const mv = async (fsObject, newName) => {
  const cmd = await fsObject.sh(
    `( cd -- ${fsObject.path.parentPath.toSh()} && exec mv -nvT -- "$(cat<<'+++EOF+++'\n${
      fsObject.path.base
    }\n+++EOF+++\n)" "$(cat<<'+++EOF+++'\n${newName}\n+++EOF+++\n)");`,
    'mv',
  )

  if (cmd.error || cmd.output === '') {
    let msg
    if (cmd.output === '') msg = `${LOCAL.renameFailed}: '${fsObject.path.base}' to '${newName}'`
    else if (cmd.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: mv: ${fsObject}`
    else if (cmd.output.includes('No such file or directory')) msg = `rename: ${LOCAL.invalidName}: '${fsObject.path.base}' to '${newName}'`
    else msg = `rename: ${cmd.output}: ${fsObject}`
    if (glob.logger) glob.logger.error(msg, 'rename')
    throw new Error(msg)
  }
  const mvFsObject = fsObject.executionContext.getFsObjectPromisePathed(
    `${fsObject.path.parentPath.addSegment(newName)}`,
  )

  mvFsObject._pvt.parent = fsObject._pvt.parent
  fsObject.markAsInvalid()
  return mvFsObject
}

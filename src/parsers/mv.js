import {LOCAL, glob} from '../util/globals.js'

export default async (fsObject, newName) => {
  const mv = await fsObject.sh(
    `( cd -- ${fsObject.path.parentPath.toSh()} && exec mv -nvT -- "$(cat<<'+++EOF+++'\n${
      fsObject.path.base
    }\n+++EOF+++\n)" "$(cat<<'+++EOF+++'\n${newName}\n+++EOF+++\n)");`,
    'mv'
  )

  if (mv.error || mv.output === '') {
    let msg
    if (mv.output === '')
      msg = `${LOCAL.renameFailed}: '${fsObject.path.base}' to '${newName}'`
    else if (mv.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: mv: ${fsObject}`
    else if (mv.output.includes('No such file or directory'))
      msg = `rename: ${LOCAL.invalidName}: '${fsObject.path.base}' to '${newName}'`
    else msg = `rename: ${mv.output}: ${fsObject}`
    if (glob.logger) glob.logger.error(msg, 'rename')
    throw new Error(msg)
  }
  const mvFsObject = fsObject.executionContext[
    `get${fsObject.constructor.name}FromPath`
  ](`${fsObject.path.parentPath.addSegment(newName)}`)

  mvFsObject._pvt.parent = fsObject._pvt.parent
  if (fsObject.state === 'loaded') fsObject._transitionState('outdated')
  return mvFsObject
}

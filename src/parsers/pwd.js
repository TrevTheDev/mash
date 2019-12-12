import {LOCAL, glob} from '../util/globals'

export default async ExecutionContext => {
  let pwd = await ExecutionContext.sh(`pwd;`, undefined, undefined, true)
  if (pwd.error) {
    let msg
    if (pwd.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: pwd`
    else msg = `pwd: ${pwd.output}`
    if (glob.logger) glob.logger.error(msg, 'pwd')
    throw new Error(msg)
  }
  pwd = [].concat(pwd)
  const paths = pwd.map(obj => obj.output)
  const unique = [...new Set(paths)]
  if (unique.length !== 1) throw new Error(`pwd: ${LOCAL.unexpectedError}`)
  return ExecutionContext.getDirectoryFromPath(unique[0].slice(0, -1))
}

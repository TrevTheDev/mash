import { LOCAL, glob } from '../util/globals.js'

/**
 * @param { ExecutionContext } executionContext
 * @returns { Promise<DirectoryPathed> }
 */
export const pwd = async (executionContext) => {
  let cmd = await executionContext.sh('pwd;', undefined, undefined, true)
  if (cmd.error) {
    let msg
    if (cmd.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: pwd`
    else msg = `pwd: ${cmd.output}`
    if (glob.logger) glob.logger.error(msg, 'pwd')
    throw new Error(msg)
  }
  cmd = [].concat(cmd)
  const paths = cmd.map((obj) => obj.output)
  const unique = [...new Set(paths)]
  if (unique.length !== 1) throw new Error(`pwd: ${LOCAL.unexpectedError}`)
  return executionContext.getDirectoryPathed(unique[0].slice(0, -1))
}

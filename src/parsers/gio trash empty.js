import { glob } from '../util/globals.js'

/**
 * @param { ExecutionContext } executionContext
 * @returns { Promise<boolean> }
 */
export const gioTrashEmpty = async (executionContext) => {
  const cmd = await executionContext.sh('gio trash --empty;')

  if (!cmd.error) return true

  const msg = `gio trash empty: ${cmd.output}`
  if (glob.logger) glob.logger.error(msg, 'gio trash')
  throw new Error(msg)
}

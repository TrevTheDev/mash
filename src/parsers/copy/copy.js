/* eslint-disable no-param-reassign */
import copyFile from './copy file'
import copyDirectory from './copy directory'
import {CP_TYPE, FILE_TYPE_ENUMS, LOCAL, glob} from '../../util/globals'
import startTimedProgressReport from './timed progress report'

export default async copyM => {
  const src = await copyM.sourceFSObj
  await Promise.all([
    (async () => {
      copyM.destinationDirectory = await copyM.destinationDirectory
      await copyM.destinationDirectory.stat(false, false, false)
    })(),
    src.stat(
      src._props && src._props.loadedGio ? src._props.loadedGio : false,
      true,
      true
    )
  ])
  if (copyM.destinationDirectory.type !== FILE_TYPE_ENUMS.directory)
    throw new Error(LOCAL.destNotADir)

  copyM.setBaseline(
    'init',
    src.size.size || src.size,
    src.size.fileCount || 1,
    src.size.directoryCount || 0
  )

  const baselineInterval = setInterval(() => copyM.setBaseline(), 30000)

  const timedProgressReport = startTimedProgressReport(copyM)

  try {
    if (src.type === FILE_TYPE_ENUMS.directory) {
      const dst = await src.executionContext.getFsObjectFromPath(
        copyM.destinationDirectory.path.addSegment(src.path.base)
      )
      copyM.progressUpdateBeforeCopy(src.path, dst.path)
      if (
        (await dst.exists) &&
        copyM.copyType === CP_TYPE.askBeforeOverwrite &&
        !(await copyM.askBeforeOverwrite(copyM.progressTracker))
      )
        copyM.cancel()
      else
        copyM.success(
          await copyDirectory(copyM, src, copyM.destinationDirectory)
        )
    } else copyM.success(await copyFile(copyM, src, copyM.destinationDirectory))
  } catch (err) {
    const msg = `${copyM.move ? 'moveTo' : 'copyTo'}: ${err.message}`
    if (glob.logger) glob.logger.error(msg, copyM.move ? 'moveTo' : 'copyTo')
    copyM.fail(new Error(msg))
  } finally {
    copyM.completedAt = new Date()
    clearInterval(timedProgressReport)
    clearInterval(baselineInterval)
  }
}

/* eslint-disable no-param-reassign */
import copyFile from './copy file.js'
import copyDirectory from './copy directory.js'
import {CP_TYPE, FILE_TYPE_ENUMS, glob, LOCAL} from '../../util/globals.js'
import ProgressReporter from './progress reporter.js'

const copy = async copyM => {
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
  copyM.startBaselining()
  copyM.progressReporter = new ProgressReporter(
    copyM,
    copyM.progressReporterInterval
  )

  try {
    let result
    if (src.type === FILE_TYPE_ENUMS.directory) {
      const dst = await src.executionContext.getFsObjectFromPath(
        copyM.destinationDirectory.path.addSegment(src.path.base)
      )
      copyM.progressUpdateBeforeCopy(src.path, dst.path)
      if ((await dst.exists) && copyM.copyType === CP_TYPE.askBeforeOverwrite) {
        await dst.stat(false, false, true)
        if (await copyM.askBeforeOverwrite(src, dst))
          result = await copyDirectory(copyM, src, copyM.destinationDirectory)
        else result = undefined
      } else {
        result = await copyDirectory(copyM, src, copyM.destinationDirectory)
      }
    } else result = await copyFile(copyM, src, copyM.destinationDirectory)
    if (copyM.cancelled) throw new Error(`${LOCAL.cancelledByUser}`)
    return result
  } catch (err) {
    const msg = `${copyM.move ? 'moveTo' : 'copyTo'}: ${err.message}`
    if (glob.logger) glob.logger.error(msg, copyM.move ? 'moveTo' : 'copyTo')
    throw new Error(msg)
  } finally {
    copyM.completedAt = new Date()
    copyM.progressReporter.stop()
    copyM.stopBaselining()
  }
}

export default copy

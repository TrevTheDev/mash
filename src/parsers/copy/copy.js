/* eslint-disable no-param-reassign */
import copyFile from './copy file.js'
import copyDirectory from './copy directory.js'
import {
  CP_TYPE, FILE_TYPE_ENUMS, glob, LOCAL,
} from '../../util/globals.js'
import ProgressReporter from './progress reporter.js'

const copy = async (copyM) => {
  const [distDir, src] = await Promise.all([
    copyM.destinationDirectory.stat(false, false, false),
    copyM.sourceFSObj.stat(false, true, true),
  ])
  copyM.destinationDirectory = distDir
  if (distDir.type !== FILE_TYPE_ENUMS.directory) throw new Error(LOCAL.destNotADir)

  copyM.setBaseline(
    'init',
    src.size.size || src.size,
    src.size.fileCount || 1,
    src.size.directoryCount || 0,
  )
  copyM.startBaselining()
  copyM.progressReporter = new ProgressReporter(
    copyM,
    copyM.progressReporterInterval,
  )

  try {
    let result
    if (src.type === FILE_TYPE_ENUMS.directory) {
      const dst = await src.executionContext.getFsObjectPromise(
        distDir.path.addSegment(src.path.base).toString(),
      )
      copyM.progressUpdateBeforeCopy(src.path, dst.path)
      if ((await dst.exists) && copyM.copyType === CP_TYPE.askBeforeOverwrite) {
        await dst.stat(false, false, true)
        result = (await copyM.askBeforeOverwrite(src, dst))
          ? await copyDirectory(copyM, src, distDir)
          : undefined
      } else result = await copyDirectory(copyM, src, distDir)
    } else result = await copyFile(copyM, src, distDir)
    if (copyM.cancelled) { // noinspection ExceptionCaughtLocallyJS
      throw new Error(`${LOCAL.cancelledByUser}`)
    }
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

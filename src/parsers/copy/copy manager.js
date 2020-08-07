import { CP_TYPE, LOCAL } from '../../util/globals.js'
// import Size from '../../formatters/size.js'
import ProgressTracker from './progress tracker.js'
// import Percentage from '../../formatters/percentage.js'
// import Rate from '../../formatters/rate.js'
import copy from './copy.js'

let outstandingPromptCounter = 0

export class CopyManager {
  /**
   * @param {FsObjectCommon} sourceFSObj
   * @param {Directory} destinationDirectory
   * @param {CP_TYPE} copyType
   * @param {boolean} confirmOverwriteCallBack
   * @param {boolean} move
   * @returns {ProgressTracker}
   */
  constructor(
    sourceFSObj,
    destinationDirectory,
    copyType = CP_TYPE.doNotOverwrite,
    confirmOverwriteCallBack,
    move = false,
  ) {
    this.sourceFSObj = sourceFSObj
    this.destinationDirectory = sourceFSObj.executionContext.getFsObject(`${destinationDirectory}`)
    this.copyType = copyType
    this.confirmOverwriteCallBack = confirmOverwriteCallBack
    this.move = move

    this.bytesCompleted = 0
    this.bytesCompletedInFlight = 0
    this.bytesRemaining = 0
    this.percentageCompleted = 0
    this.rateOfCompletion = 0
    this.deltaRateOfCompletion = 0
    this.progressFileCount = 0
    this.progressDirectoryCount = 0
    this.progressTracker = new ProgressTracker(this)

    this.progressReporterInterval = 2000
    this.baselineInterval = 30000

    this.promise = new Promise((resolve, cancel) => {
      this.success = resolve
      this.fail = cancel
      copy(this)
        .then((results) => resolve(results))
        .catch((error) => cancel(error))
    })

    this.overwriteAll = undefined

    return this.progressTracker
  }

  cancel() {
    this.cancelled = true
  }
  /*
                                                                    888     888               888          888
                                                                    888     888               888          888
                                                                    888     888               888          888
88888b.  888d888 .d88b.   .d88b.  888d888 .d88b.  .d8888b  .d8888b  888     888 88888b.   .d88888  8888b.  888888 .d88b.
888 "88b 888P"  d88""88b d88P"88b 888P"  d8P  Y8b 88K      88K      888     888 888 "88b d88" 888     "88b 888   d8P  Y8b
888  888 888    888  888 888  888 888    88888888 "Y8888b. "Y8888b. 888     888 888  888 888  888 .d888888 888   88888888
888 d88P 888    Y88..88P Y88b 888 888    Y8b.          X88      X88 Y88b. .d88P 888 d88P Y88b 888 888  888 Y88b. Y8b.
88888P"  888     "Y88P"   "Y88888 888     "Y8888   88888P'  88888P'  "Y88888P"  88888P"   "Y88888 "Y888888  "Y888 "Y8888
888                           888                                               888
888                      Y8b d88P                                               888
888                       "Y88P"                                                888
*/

  startBaselining() {
    this._baselineInterval = setInterval(
      () => this.setBaseline(),
      this.baselineInterval,
    )
  }

  stopBaselining() {
    clearInterval(this._baselineInterval)
  }

  progressUpdateBeforeCopy(sourcePath, destinationDirectoryPath) {
    this.currentSourcePath = sourcePath
    this.currentDestinationDirectoryPath = destinationDirectoryPath
  }

  progressUpdate(deltaBytes, inFlightDeltaBytes = 0) {
    this.progressLastProvidedAt = Date.now()
    this.bytesCompleted = deltaBytes + this.bytesCompleted
    this.bytesCompletedInFlight = this.bytesCompleted + inFlightDeltaBytes
  }

  progressUpdateDirDone() {
    this.progressDirectoryCount += 1
  }

  progressUpdateAfterFileCopied(fileSize) {
    this.progressFileCount += 1
    this.progressUpdate(fileSize)
  }

  setBaseline(
    baseline = '_next',
    targetBytes = this.baseline.targetBytes,
    targetFileCount = this.baseline.targetFileCount,
    targetDirectoryCount = this.baseline.targetDirectoryCount,
  ) {
    this[baseline] = {
      targetBytes,
      targetFileCount,
      targetDirectoryCount,
      progressBytes: this.bytesCompletedInFlight,
      progressFileCount: this.progressFileCount,
      progressDirectoryCount: this.progressDirectoryCount,
      progressUpdates: [],
      baselinedAt: Date.now(),
      progressLastProvidedAt: this.progressLastProvidedAt,
      deltaRateOfCompletion: this.deltaRateOfCompletion,
    }
    this.currentBaseline = baseline
  }

  get baseline() {
    return this[this.currentBaseline]
  }

  get targetBytes() {
    return this.baseline.targetBytes
  }

  async askBeforeOverwrite(srcFSObject, destFSObject) {
    if (this.overwriteAll !== undefined) return this.overwriteAll

    outstandingPromptCounter += 1
    if (outstandingPromptCounter === 1) {
      this.stopBaselining()
      // noinspection JSUnresolvedVariable
      this.progressReporter.stop()
    }
    const res = await this.confirmOverwriteCallBack({
      progressReport: this.progressTracker.toJSON(),
      sourceFSObject: srcFSObject.toJSON(),
      destFSObject: destFSObject.toJSON(),
    })
    outstandingPromptCounter -= 1
    if (outstandingPromptCounter === 0) {
      this.startBaselining()
      // noinspection JSUnresolvedVariable
      this.progressReporter.start()
    }

    if (res === 'yes') return true
    if (res === 'no') return false
    if (res === 'all') {
      this.overwriteAll = true
      return true
    }
    if (res === 'none') {
      this.overwriteAll = false
      return false
    }
    if (res === 'cancel') {
      this.cancel()
      throw new Error(`${LOCAL.cancelledByUser}`)
    }

    throw new Error(
      "unknown overwrite return value, valid is 'yes', 'no', 'all','none' and 'cancel'",
    )
  }
}

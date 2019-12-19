import {CP_TYPE, LOCAL} from '../../util/globals.js'
import Size from '../../formatters/size.js'
import ProgressTracker from '../../util/progress tracker.js'
import Percentage from '../../formatters/percentage.js'
import Rate from '../../formatters/rate.js'
import copy from './copy.js'

export default class CopyManager {
  constructor(
    sourceFSObj,
    destinationDirectory,
    copyType = CP_TYPE.doNotOverwrite,
    confirmOverwriteCallBack,
    move = false
  ) {
    this.sourceFSObj = sourceFSObj

    this.destinationDirectory = sourceFSObj.executionContext.getDirectoryFromPath(
      `${destinationDirectory}`
    )

    this.copyType = copyType
    this.confirmOverwriteCallBack = confirmOverwriteCallBack
    this.move = move

    this.bytesCompleted = new Size(0)
    this.bytesCompletedInFlight = new Size(0)
    this.bytesRemaining = new Size(0)
    this.percentageCompleted = new Percentage(0)
    this.rateOfCompletion = new Rate(0)
    this.deltaRateOfCompletion = new Rate(0)
    this.progressFileCount = 0
    this.progressDirectoryCount = 0
    this.progressTracker = new ProgressTracker(this)

    this.promise = new Promise((resolve, cancel) => {
      this.success = resolve
      this.fail = cancel
      copy(this)
    })

    this.overwriteAll = undefined

    return this.progressTracker
  }

  cancel() {
    this.cancelled = true
    this.fail(new Error(`${LOCAL.cancelledByUser}`))
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

  progressUpdateBeforeCopy(sourcePath, destinationDirectoryPath) {
    this.currentSourcePath = sourcePath
    this.currentDestinationDirectoryPath = destinationDirectoryPath
  }

  progressUpdate(deltaBytes, inFlightDeltaBytes = 0) {
    this.progressLastProvidedAt = Date.now()
    this.bytesCompleted.bytes = deltaBytes + this.bytesCompleted
    this.bytesCompletedInFlight.bytes = this.bytesCompleted + inFlightDeltaBytes
  }

  progressUpdateDirDone() {
    // this.currentSourcePath = undefined
    // this.currentDestinationDirectoryPath = undefined
    this.progressDirectoryCount += 1
  }

  progressUpdateAfterFileCopied(fileSize) {
    // this.currentSourcePath = undefined
    // this.currentDestinationDirectoryPath = undefined
    this.progressFileCount += 1
    this.progressUpdate(fileSize)
  }

  setBaseline(
    baseline = '_next',
    targetBytes = this.baseline.targetBytes,
    targetFileCount = this.baseline.targetFileCount,
    targetDirectoryCount = this.baseline.targetDirectoryCount
  ) {
    this[baseline] = {
      targetBytes,
      targetFileCount,
      targetDirectoryCount,
      progressBytes: this.bytesCompletedInFlight.size,
      progressFileCount: this.progressFileCount,
      progressDirectoryCount: this.progressDirectoryCount,
      progressUpdates: [],
      baselinedAt: Date.now(),
      progressLastProvidedAt: this.progressLastProvidedAt,
      deltaRateOfCompletion: this.deltaRateOfCompletion
    }
    this.currentBaseline = baseline
  }

  get baseline() {
    return this[this.currentBaseline]
  }

  get targetBytes() {
    return this.baseline.targetBytes
  }

  async askBeforeOverwrite() {
    if (this.overwriteAll !== undefined) return this.overwriteAll
    const res = await this.confirmOverwriteCallBack(this.progressTracker)
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
    if (res === 'cancel') return this.cancel()
    throw new Error(
      "unknown overwrite return value, valid is 'yes', 'no', 'all','none' and 'cancel'"
    )
  }
}

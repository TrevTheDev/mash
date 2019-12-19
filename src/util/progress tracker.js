import {EventEmitter} from 'events'
import * as datefns from 'date-fns'
// import * as format from 'date-fns/format/index.js'
// import * as formatDistance from 'date-fns/esm/formatDistance/index.js'

const {format, formatDistance} = datefns.default || datefns

export default class ProgressTracker extends EventEmitter {
  constructor(copyManager) {
    super()
    this._copyManager = copyManager
  }

  cancel() {
    return this._copyManager.cancel()
  }

  get bytesCompleted() {
    return this._copyManager.bytesCompletedInFlight
  }

  get bytesRemaining() {
    return this._copyManager.bytesRemaining
  }

  get deltaElapsedTime() {
    return this._copyManager.deltaElapsedTime
  }

  get elapsedTime() {
    return this._copyManager.elapsedTime
  }

  get elapsedTimeF() {
    return formatDistance(new Date(), this._copyManager.init.baselinedAt)
  }

  get percentageCompleted() {
    return this._copyManager.percentageCompleted
  }

  get deltaRateOfCompletion() {
    return this._copyManager.deltaRateOfCompletion
  }

  get rateOfCompletion() {
    return this._copyManager.rateOfCompletion
  }

  get deltaETC() {
    const roc = this.deltaRateOfCompletion
    const timeNow = new Date()
    if (this.bytesRemaining.bytes === 0) return formatDistance(timeNow, timeNow)
    if (roc.number === 0 || Number.isNaN(roc.number)) return Infinity
    return formatDistance(
      timeNow,
      new Date(timeNow.valueOf() + this.bytesRemaining / roc.number)
    )
  }

  get ETC() {
    const roc = this.rateOfCompletion
    const timeNow = new Date()
    if (this.bytesRemaining.bytes === 0) return formatDistance(timeNow, timeNow)
    if (roc.number === 0 || Number.isNaN(roc.number)) return Infinity
    return formatDistance(
      timeNow,
      new Date(timeNow.valueOf() + this.bytesRemaining / roc.number)
    )
  }

  get targetBytes() {
    return this._copyManager.baseline.targetBytes
  }

  get targetFileCount() {
    return this._copyManager.baseline.targetFileCount
  }

  get targetDirectoryCount() {
    return this._copyManager.baseline.targetDirectoryCount
  }

  get progressFileCount() {
    return this._copyManager.progressFileCount
  }

  get progressDirectoryCount() {
    return this._copyManager.progressDirectoryCount
  }

  get sourceFSObject() {
    return this._copyManager.sourceFSObj
  }

  get destinationDirectory() {
    return this._copyManager.destinationDirectory
  }

  get currentSourcePath() {
    return this._copyManager.currentSourcePath
  }

  get currentDestinationDirectoryPath() {
    return this._copyManager.currentDestinationDirectoryPath
  }

  get startedAt() {
    return format(this._copyManager.init.baselinedAt, 'pp')
  }

  then(...thenArgs) {
    return this._copyManager.promise.then(...thenArgs)
  }
}

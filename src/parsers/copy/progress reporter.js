/* eslint-disable no-param-reassign */
export default class ProgressReporter {
  constructor(copyManager, interval = 2000) {
    this.lastTimeProgressReported = 0
    this.copyManager = copyManager
    this.interval = interval
    this._interval = undefined
    return this.start()
  }

  start() {
    if (!this._interval) {
      const cM = this.copyManager
      this._interval = setInterval(() => {
        if (this.lastTimeProgressReported > Date.now() - 2000) return
        this.lastTimeProgressReported = Date.now()
        cM.bytesRemaining = cM.targetBytes - cM.bytesCompletedInFlight

        cM.percentageCompleted = cM.bytesCompletedInFlight / cM.targetBytes

        cM.progressReportingElapsedTime = cM.progressLastProvidedAt - cM.baseline.progressLastProvidedAt

        cM.elapsedTime = cM.progressLastProvidedAt - cM.init.baselinedAt

        cM.rateOfCompletion = cM.elapsedTime !== 0
          ? cM.bytesCompletedInFlight / cM.elapsedTime
          : undefined

        cM.deltaElapsedTime = cM.progressLastProvidedAt - cM.baseline.progressLastProvidedAt
        cM.deltaRateOfCompletion = cM.rateOfCompletion
        cM.progressTracker.emit('progressUpdate', cM.progressTracker)
      }, this.interval)
    }
    return this
  }

  stop() {
    clearInterval(this._interval)
    this._interval = undefined
    return this
  }
}

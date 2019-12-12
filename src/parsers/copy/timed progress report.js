/* eslint-disable no-param-reassign */
export default copyM => {
  let lastTimeProgressReported = 0
  const timedProgressReport = setInterval(() => {
    if (lastTimeProgressReported > Date.now() - 2000) return
    lastTimeProgressReported = Date.now()
    copyM.bytesRemaining.bytes =
      copyM.targetBytes - copyM.bytesCompletedInFlight

    copyM.percentageCompleted.percentage =
      copyM.bytesCompletedInFlight / copyM.targetBytes

    copyM.progressReportingElapsedTime =
      copyM.progressLastProvidedAt - copyM.baseline.progressLastProvidedAt

    copyM.elapsedTime = copyM.progressLastProvidedAt - copyM.init.baselinedAt

    copyM.rateOfCompletion.rate =
      copyM.elapsedTime !== 0
        ? copyM.bytesCompletedInFlight / copyM.elapsedTime
        : undefined

    copyM.deltaElapsedTime =
      copyM.progressLastProvidedAt - copyM.baseline.progressLastProvidedAt
    copyM.deltaRateOfCompletion.rate = copyM.rateOfCompletion.rate
    copyM.progressTracker.emit('progressUpdate', copyM.progressTracker)
  }, 2000)
  return timedProgressReport
}

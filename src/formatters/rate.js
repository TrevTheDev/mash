import NumberWithCommas from './number with commas.js'
import {
  DECIMAL_BYTE_SCALE, // ,
  // BINARY_BYTE_SCALE,
  // DECIMAL_BIT_SCALE,
  // BINARY_BIT_SCALE
} from './size.js'
import { isNumber } from '../util/utils.js'

export default class Rate {
  constructor(rateInBytesPerSecond, fixedScale, scales = DECIMAL_BYTE_SCALE) {
    this._scaledNumber = new NumberWithCommas()
    if (fixedScale) {
      this._fixedScale = fixedScale
      this.scale = fixedScale
    }
    this._scales = scales
    this.rate = rateInBytesPerSecond
    this._scalesArray = Object.entries(scales.scale).map(([key, value]) => [
      key,
      `${key}/s`,
      value,
    ])
  }

  set rate(rateInBytesPerSecond) {
    this._number = rateInBytesPerSecond
  }

  // noinspection JSUnusedGlobalSymbols
  get rate() {
    return this.number
  }

  set scale(scale) {
    this._scale = scale > 6 ? 6 : scale;
    [, this._scaledNumber.suffix] = this._scalesArray[this._scale]
  }

  get number() {
    return this._number
  }

  get scaledNumber() {
    this._scaledNumber.number = this._number / 1000 ** this._scale
    return this._scaledNumber
  }

  toString() {
    if (!isNumber(this._number)) return undefined
    if (!this._fixedScale) {
      this.scale = this._number === 0
        ? 0
        : Math.floor(Math.log(this._number) / this._scales.ScaleFactor)
    }

    return `${this.scaledNumber}`
  }

  valueOf() {
    return this._number
  }
}

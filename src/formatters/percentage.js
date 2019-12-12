export default class Percentage {
  constructor(number, precision = 0) {
    this.percentage = number
    this._precision = precision
  }

  get number() {
    return this._number
  }

  set percentage(value) {
    this._number = value
  }

  toString() {
    return `${(this._number * 100).toFixed(this._precision)}%`
  }

  valueOf() {
    return this._number
  }

  get precision() {
    return this._precision
  }
}

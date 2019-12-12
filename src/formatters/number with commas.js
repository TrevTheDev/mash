export default class NumberWithCommas {
  constructor(number, precision, suffix = '') {
    this.number = number
    this.suffix = suffix
    this._precision = precision
  }

  get number() {
    return this._number
  }

  set number(value) {
    this._number = value
  }

  get precision() {
    if (this._precision) return this._precision
    return this._number >= 100 ? 1 : 2
  }

  get suffix() {
    return this._suffix
  }

  set suffix(value) {
    this._suffix = value
  }

  toString() {
    if (Number.isNaN(this._number)) return this._number
    return `${parseFloat(parseFloat(this._number).toFixed(this.precision))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${this._suffix}`
  }

  valueOf() {
    return this._number
  }
}

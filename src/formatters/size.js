import NumberWithCommas from './number with commas.js'

export const DECIMAL_BYTE_SCALE = {
  scale: {
    B: 1,
    kB: 1000,
    MB: 1000000,
    GB: 1000000000,
    TB: 1000000000000,
    PB: 1000000000000000,
    EB: 1000000000000000000,
  },
  ScaleFactor: Math.log(1000),
  fudgeFactor: 0.24,
}
export const BINARY_BYTE_SCALE = {
  scale: {
    B: 1,
    KiB: 1024,
    MiB: 1048576,
    GiB: 1073741824,
    TiB: 1099511627776,
    PiB: 1125899906842624,
    EiB: 1152921504606847000,
  },
  ScaleFactor: Math.log(1024),
  fudgeFactor: 0.245,
}
export const DECIMAL_BIT_SCALE = {
  scale: {
    B: 1,
    kbit: 125,
    Mbit: 125000,
    Gbit: 125000000,
    Tbit: 125000000000,
    Pbit: 125000000000000,
    Ebit: 125000000000000000,
  },
  ScaleFactor: Math.log(1000),
  fudgeFactor: 0.27,
}
export const BINARY_BIT_SCALE = {
  scale: {
    B: 1,
    Kibit: 128,
    Mibit: 131072,
    Gibit: 134217728,
    Tibit: 137438953472,
    Pibit: 140737488355328,
    Eibit: 144115188075855872,
  },
  ScaleFactor: Math.log(1024),
  fudgeFactor: 0.275,
}

const SCALE = DECIMAL_BYTE_SCALE
const UnitsOfMeasure = Object.keys(SCALE.scale)

const numberWithComma = new NumberWithCommas()
export default class Size {
  constructor(sizeInBytes, fixedUnitOfMeasure = undefined) {
    this._fixedUnitOfMeasure = fixedUnitOfMeasure
    this._bytes = sizeInBytes
  }

  get bytes() {
    return this._bytes
  }

  get B() {
    return this._bytes
  }

  set bytes(sizeInBytes) {
    this._bytes = sizeInBytes
  }

  get unitOfMeasure() {
    let unitOfMeasure
    if (this._fixedUnitOfMeasure) unitOfMeasure = this._fixedUnitOfMeasure
    else if (this.bytes === 0) unitOfMeasure = 0
    else {
      unitOfMeasure = Math.floor(
        Math.log(Math.abs(this.bytes)) / SCALE.ScaleFactor - SCALE.fudgeFactor,
      )
    }
    return UnitsOfMeasure[unitOfMeasure]
  }

  scaledValue(unitOfMeasure = this.unitOfMeasure) {
    return this.B / SCALE.scale[unitOfMeasure]
  }

  toString() {
    const { unitOfMeasure } = this
    numberWithComma.suffix = unitOfMeasure
    numberWithComma.number = this.scaledValue(unitOfMeasure)
    return `${numberWithComma}`
  }

  toJSON() {
    return {
      sizeString: this.toString(),
      bytes: this.bytes,
      unitOfMeasure: this.unitOfMeasure,
    }
  }

  valueOf() {
    return this.bytes
  }
}

import Size, {
  DECIMAL_BYTE_SCALE,
  BINARY_BYTE_SCALE,
  DECIMAL_BIT_SCALE,
  BINARY_BIT_SCALE,
} from './size.js'

const SCALE = {
  ...DECIMAL_BYTE_SCALE.scale,
  ...BINARY_BYTE_SCALE.scale,
  ...DECIMAL_BIT_SCALE.scale,
  ...BINARY_BIT_SCALE.scale,
}

const numberFromLocaleString = (stringValue, locale) => {
  const parts = Number(1111.11)
    .toLocaleString(locale)
    .replace(/\d+/g, '')
    .split('')
  if (stringValue === null) return null
  if (parts.length === 1) parts.unshift('')

  return Number(
    String(stringValue)
      .replace(new RegExp(parts[0].replace(/\s/g, ' '), 'g'), '')
      .replace(parts[1], '.'),
  )
}

const splitString = (str) => {
  const arr = []
  const numRegEx = /([^0-9,.]+)?([0-9,.]+)?/y // (\D+)?(\d+)?/y
  let match
  do {
    match = numRegEx.exec(str)
    if (match[1] !== undefined) arr.push(match[1])
    if (match[2] !== undefined) arr.push(numberFromLocaleString(match[2]))
  } while (match[0])
  return arr
}

export default (sizeString) => {
  const split = splitString(sizeString.replace(/\s+/g, ''))
  const res = split[0] * SCALE[split[1]]
  return new Size(res)
}

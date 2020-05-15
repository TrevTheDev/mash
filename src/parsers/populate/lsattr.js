const lsattrTrans = {
  a: ['appendOnly', false],
  c: ['compressed', false],
  d: ['noDump', false],
  e: ['extentFormat', false],
  i: ['immutable', false],
  j: ['dataJournaling', false],
  s: ['secureDeletion', false],
  t: ['noTailMerging', false],
  u: ['unDeletable', false],
  A: ['noAtimeUpdates', false],
  D: ['synchronousDirectoryUpdates', false],
  S: ['synchronousUpdates', false],
  T: ['topOfDirectoryHierarchy', false],
  h: ['hugeFile', true],
  N: ['inline Data', true],
  E: ['compressionError', true],
  I: ['indexedDirectory', true],
  X: ['compressionRawAccess', true],
  Z: ['compressedDirtyFile false]', true]
}

class Lsattr {
  constructor(flags) {
    this._array = []
    flags.forEach(attr => {
      this._array.push(attr)
      Object.defineProperty(this, lsattrTrans[attr][0], {
        configurable: true,
        enumerable: true,
        value: true,
        writable: false
      })
    })
  }

  get array() {
    return this._array
  }

  get toClone() {
    return this.array
      .filter(attr => {
        return !['I', 'E', 'h', 'N', 'X', 'z'].includes(attr)
      })
      .join('')
  }

  toString() {
    return this.array.join('')
  }

  toJSON() {
    const obj = {lsattr: this.toString()}
    this.array.forEach(attr => {
      obj[`${lsattrTrans[attr][0]}`] = true
    })
    return obj
  }
}
/**
 * takes raw lsattr output, parses it, and updates `fsObj`
 * @param {string} lsattrOutput - raw string output from lsattr
 * @param {FsObject} fsObj - obj to imbue with lsattr information
 * @returns updated `fsObj`
 */
const lsattr = (lsattrOutput, fsObj) => {
  const obj = fsObj._props
  if (lsattrOutput.includes('LSATTRFAILED')) {
    obj.loadedLsattr = false
    obj.lsattrOutput = lsattrOutput
    return
  }
  obj.lsattr = new Lsattr(
    lsattrOutput
      .split(' ')[0]
      .replace(/-/g, '')
      .split('')
  )
  obj.loadedLsattr = true
}
export default lsattr

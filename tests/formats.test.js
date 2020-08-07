import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Rate from '../src/formatters/rate.js'
import Size from '../src/formatters/size.js'
import stringToSize from '../src/formatters/string to size.js'

chai.use(chaiAsPromised)

const { expect } = chai

describe('number formats', () => {
  it('test rate formatter', async () => {
    // expect(`${new Rate(1500)}`).to.equal(`1,500B/s`)
    expect(`${new Rate(0)}`).to.equal('0B/s')
    expect(`${new Rate(5000)}`).to.equal('5kB/s')
    expect(`${new Rate(5000 * 1000)}`).to.equal('5MB/s')
    expect(`${new Rate(5000 * 1000 * 1000)}`).to.equal('5GB/s')
    expect(`${new Rate(5000 * 1000 * 1000 * 1000)}`).to.equal('5TB/s')
    expect(`${new Rate(5000 * 1000 * 1000 * 1000 * 1000)}`).to.equal('5PB/s')
    expect(`${new Rate(5000 * 1000 * 1000 * 1000 * 1000 * 1000)}`).to.equal(
      '5EB/s',
    )
  })

  it('reports sizes correctly', () => {
    let xOld = { unitOfMeasure: '' }
    for (let i = 0; i < 1024 * 1024 * 1024 * 10; i += 1000) {
      const x = new Size(i)
      if (x.unitOfMeasure !== xOld.unitOfMeasure) {
        console.log(`${xOld}`)
        console.log(`${x}`)
      }
      xOld = x
    }

    expect(`${new Size(0)}`).to.equal('0B')
    expect(`${new Size(1000)}`).to.equal('1,000B')
    expect(`${new Size(1000 * 1000)}`).to.equal('1,000kB')
    expect(`${new Size(1000 * 1000 * 1000)}`).to.equal('1,000MB')
    expect(new Size(1000 * 1000 * 1000) * 1).to.equal(1000 * 1000 * 1000)
    expect(`${new Size(1000 * 1000 * 1000 * 1000)}`).to.equal('1,000GB')
    expect(`${new Size(1000 * 1000 * 1000 * 1000 * 1000)}`).to.equal('1,000TB')
    expect(`${new Size(1000 * 1000 * 1000 * 1000 * 1000 * 1000)}`).to.equal(
      '1,000PB',
    )
    expect(
      `${new Size(1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000)}`,
    ).to.equal('1,000EB')
  })
  it('converts string to size', () => {
    expect(stringToSize('1kB').B).to.equal(1000)
    expect(stringToSize('1.1 kB').B).to.equal(1100)
    expect(stringToSize('1,000,000.1 kB').B).to.equal(1000000100)
    expect(stringToSize('1 kB').B).to.equal(1000)
    expect(stringToSize('1KiB').B).to.equal(1024)
    expect(stringToSize('1KiB').B).to.equal(1024)
    expect(stringToSize('1Eibit').B).to.equal(144115188075855872)
  })
})

/* eslint-disable no-unused-expressions */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {Path} from '../src/locations/path.js'

chai.use(chaiAsPromised)

const {expect} = chai

describe('path', () => {
  it('encodes a posix url correctly', () => {
    let pth = new Path('/home/user')
    expect(`${pth}`).to.equal('/home/user')
    expect(pth.constructor.name).to.equal('Path')
    expect(`${pth.parentPath}`).to.equal('/home')
    expect(`${pth.addSegment('dir')}`).to.equal('/home/user/dir')
    expect(`${pth.addSegment('/dirX')}`).to.equal('/home/user/dirX')
    expect(`${pth.addSegment('dirZ/')}`).to.equal('/home/user/dirZ')
    pth = new Path('/')
    expect(`${pth}`).to.equal('/')
    expect(pth.isRoot).to.be.true
    pth = new Path('///')
    expect(`${pth}`).to.equal('/')
    pth = new Path('home/')
    expect(`${pth}`).to.equal('home')
    expect(pth.isRoot).to.be.false
    pth = new Path('home///test/')
    expect(`${pth}`).to.equal('home/test')
    pth = new Path('home/../home/')
    expect(`${pth}`).to.equal('home')
    pth = new Path('/home/user/bob.txt')
    expect(`${pth.parentPath}`).to.equal('/home/user')
    expect(`${pth.parentPath.parentPath}`).to.equal('/home')
    expect(`${pth.parentPath.parentPath.parentPath}`).to.equal('/')
    expect(`${pth.parentPath.parentPath.parentPath.parentPath}`).to.equal('/')
    expect(pth.isValid).to.be.true
    pth = new Path('/x\nx/yy\\s')
    expect(pth.isValid).to.be.false
    expect(() => {
      // eslint-disable-next-line no-new
      new Path('')
    }).to.throw()
  })
  it('encodes a file URI scheme', () => {
    const pth = new Path('file://localhost/home/user')
    expect(`${pth}`).to.equal('/home/user')
  })
})

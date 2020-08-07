/* eslint-disable no-unused-expressions,mocha/no-skipped-tests */
/* eslint-disable no-undef */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiArrays from 'chai-arrays'
import Server, { u } from '../src/server.js'

chai.use(chaiAsPromised)
chai.use(chaiArrays)

const { expect } = chai

describe.skip('xxx Work In Progress', () => {
  let server
  let cwd
  let tstDir
  before(async () => {
    server = Server.instance || new Server()
    cwd = u()
    tstDir = await cwd.addDirectory('test', true)
  })
  after(() => {
    server.close()
  })
  describe('addDirectory', () => {
    it('should fail with invalid characters', async () => {
      await expect(testDir.addDirectory('')).to.be.rejectedWith(
        'pathString must be defined and may not be an empty string',
      )
      await expect(testDir.addDirectory()).to.be.rejectedWith(
        'invalid directory name(s)',
      )
      await expect(testDir.addDirectory({})).to.be.rejectedWith(
        'invalid directory name(s)',
      )
      await expect(testDir.addDirectory('zx\\zxz')).to.be.rejectedWith(
        'invalid directory name',
      )
      await expect(testDir.addDirectory(' ')).to.be.rejectedWith(
        'invalid directory name',
      )
      await expect(testDir.addDirectory(' valid')).to.be.rejectedWith(
        'invalid directory name',
      )
    })
  })
  describe('addFile', () => {
    it('should fail with invalid characters', async () => {
      expect(testDir.addDirectory('')).to.be.rejectedWith(
        'invalid directory name',
      )
      expect(testDir.addDirectory()).to.be.rejectedWith(
        'invalid directory name',
      )
      expect(testDir.addDirectory({})).to.be.rejectedWith(
        'invalid directory name',
      )
      expect(testDir.addDirectory('zx\\zxz')).to.be.rejectedWith(
        'invalid directory name',
      )
      expect(testDir.addDirectory(' ')).to.be.rejectedWith(
        'invalid directory name',
      )
      expect(testDir.addDirectory(' valid')).to.be.rejectedWith(
        'invalid directory name',
      )
    })
  })

  it('can su', async () => {
    expect(false).to.be.true
    // server = new Server()
    // let whoamitst = await server.users.getUser()
    // expect(`${whoamitst}`).to.equal('trevor')
    // const shell = await expect(server.shell.su('testusr', 'testusr')).to.be
    //   .fulfilled
    // whoamitst = await server.users.getUser()
    // expect(`${whoamitst}`).to.equal('testusr')
  })

  it('can u().u(`path`) without await', async () => {})
  it('can u().parent without await', async () => {})

  it("u('./path/to/source').watch", async () => {
    const F1 = await tstDir.addFile('newFile.txt')
    F1.watch.then(() => {
      expect(true).to.be.true
    })
    await F1.touch
  })

  describe('find', () => {
    it('should search based on supplied options', async () => {})
    it('should fail with invalid characters', async () => {})
  })

  describe('properties', () => {
    it('return user', async () => {})
    it('return group', async () => {})
    it('return inode', async () => {})
    it('return disk', async () => {})
    it('return size', async () => {})
    it('return size tree', async () => {})
    it('return appropriate icon', async () => {})
    it('set icon?', async () => {})
    it('be added to favorites and other categories', async () => {})
    it('be named', async () => {})
    it('identify links to this directory', async () => {})
  })
})

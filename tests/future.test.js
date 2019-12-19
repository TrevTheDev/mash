/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiArrays from 'chai-arrays'
import Server, {u} from '../src/server.js'

chai.use(chaiAsPromised)
chai.use(chaiArrays)

const {expect} = chai

describe.skip('xxx Work In Progress', () => {
  const server = Server.instance || new Server()
  const cwd = u()
  let tstDir
  before(async () => {
    tstDir = await cwd.addDirectory('test', true)
  })
  after(() => {
    server.close()
  })
  describe.skip('addDirectory', () => {
    it('should fail with invalid characters', async () => {
      await expect(testDir.addDirectory('')).to.be.rejectedWith(
        'pathString must be defined and may not be an empty string'
      )
      await expect(testDir.addDirectory()).to.be.rejectedWith(
        'invalid directory name(s)'
      )
      await expect(testDir.addDirectory({})).to.be.rejectedWith(
        'invalid directory name(s)'
      )
      await expect(testDir.addDirectory('zx\\zxz')).to.be.rejectedWith(
        'invalid directory name'
      )
      await expect(testDir.addDirectory(' ')).to.be.rejectedWith(
        'invalid directory name'
      )
      await expect(testDir.addDirectory(' valid')).to.be.rejectedWith(
        'invalid directory name'
      )
    })
  })
  describe.skip('addFile', () => {
    it('should fail with invalid characters', async () => {
      expect(testDir.addDirectory('')).to.be.rejectedWith(
        'invalid directory name'
      )
      expect(testDir.addDirectory()).to.be.rejectedWith(
        'invalid directory name'
      )
      expect(testDir.addDirectory({})).to.be.rejectedWith(
        'invalid directory name'
      )
      expect(testDir.addDirectory('zx\\zxz')).to.be.rejectedWith(
        'invalid directory name'
      )
      expect(testDir.addDirectory(' ')).to.be.rejectedWith(
        'invalid directory name'
      )
      expect(testDir.addDirectory(' valid')).to.be.rejectedWith(
        'invalid directory name'
      )
    })
  })

  it.skip('can su', async () => {
    expect(false).to.be.true
    // server = new Server()
    // let whoamitst = await server.users.getUser()
    // expect(`${whoamitst}`).to.equal('trevor')
    // const shell = await expect(server.shell.su('testusr', 'testusr')).to.be
    //   .fulfilled
    // whoamitst = await server.users.getUser()
    // expect(`${whoamitst}`).to.equal('testusr')
  })

  it.skip('can u().u(`path`) without await', async () => {})
  it.skip('can u().parent without await', async () => {})

  it.skip("u('./path/to/source').watch", async () => {
    const F1 = await tstDir.addFile('newFile.txt')
    F1.watch.then(() => {
      expect(true).to.be.true
    })
    await F1.touch
  })

  describe.skip('find', () => {
    it.skip('should search based on supplied options', async () => {})
    it.skip('should fail with invalid characters', async () => {})
  })

  describe.skip('properties', () => {
    it.skip('return user', async () => {})
    it.skip('return group', async () => {})
    it.skip('return inode', async () => {})
    it.skip('return disk', async () => {})
    it.skip('return size', async () => {})
    it.skip('return size tree', async () => {})
    it.skip('return appropriate icon', async () => {})
    it.skip('set icon?', async () => {})
    it.skip('be added to favorites and other categories', async () => {})
    it.skip('be named', async () => {})
    it.skip('identify links to this directory', async () => {})
  })
})

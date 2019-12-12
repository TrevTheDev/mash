/* eslint-disable no-unused-expressions */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Server, {u, ShellHarness} from '../server'

chai.use(chaiAsPromised)

const {expect} = chai

describe('read/write files', () => {
  let cwd
  let tstDir
  before(async () => {
    cwd = u()
    tstDir = await cwd.addDirectory('test', true)
  })
  after(() => {
    Server.instance.close()
  })

  it('Can read and write a string to a file', async () => {
    await u(`${tstDir}/rwfileA.txt`).delete(true, undefined, true)
    const file = u(`${tstDir}/rwfileA.txt`)
    const fileContent = 'TO BE WRITTEN\0\t\b\n\r\0'
    await expect(file.write(fileContent)).to.be.fulfilled
    const res = await file.read()
    expect(res).to.equal(fileContent)
  })
  it('Can read and write a specific locations is a file', async () => {
    await u(`${tstDir}/rwfileB.txt`).delete(true, undefined, true)
    const file = u(`${tstDir}/rwfileB.txt`)
    const fileContent = 'TO BE WRITTEN'
    await file.write(fileContent)
    let res = await file.readChunk(3, 2)
    expect(res).to.equal('BE')
    expect(await file.writeChunk('XX', 3)).to.be.true
    res = await file.read()
    expect(res).to.equal('TO XX WRITTEN')
  })

  it('Can read and write a string to a readStream/writeStream', async () => {
    await u(`${tstDir}/rwfileC.txt`).delete(true, undefined, true)
    const file = u(`${tstDir}/rwfileC.txt`)
    const fileContent = 'TO BE WRITTEN'
    await expect(file.write(fileContent)).to.be.fulfilled
    const res = await file.read()
    expect(res).to.equal(fileContent)
  })

  it('Preserves permissions', async () => {
    const testusrShell = new ShellHarness({
      user: 'testusr',
      rootPassword: process.env.RPASSWORD
    })
    await u(`${tstDir}/rwfileDir`).delete(true, undefined, true)
    const rwfileDir = await tstDir.addDirectory('rwfileDir', true)

    await rwfileDir.setPermissions('777', true)
    const RL1 = await u(`${rwfileDir}`, testusrShell).addDirectory('L1')
    const file = await RL1.addFile('testFile', 'content')
    await file.stat()
    expect(`${file.user}`).to.equal('testusr')
    await RL1.delete(true)
    testusrShell.close()
  })
})

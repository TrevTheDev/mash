/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiArrays from 'chai-arrays'
import ShellHarness from '@trevthedev/shell-harness'
import Server, {u, sh} from './server'
import {CP_TYPE} from './util/globals'

chai.use(chaiAsPromised)
chai.use(chaiArrays)

const {expect} = chai

describe('quick tests', () => {
  let server
  let cwd
  let tstDir
  before(async () => {
    server = Server.instance || new Server()
    cwd = u()
    tstDir = await cwd.addDirectory('test', true)
  })
  after(() => {
    //    if (Server.instance) Server.instance.close()
  })
  it("u('./path/to/dir').content", async () => {
    const content = await u(`${cwd}`).content
    expect(content.constructor.name).to.equal('FSObjectArray')
  })
  it("u(['./path/to/dir', '/another/path'])", async () => {
    const arr = u([`${cwd}`, `${tstDir}`])
    expect(`${arr[0]}`).to.equal(`${cwd}`)
    expect(`${arr[1]}`).to.equal(`${tstDir}`)
  })
  it('u()', async () => {
    expect(`${(await u().stat()).path}`).to.be.equal(`${process.cwd()}`)
  })
  it("u('/path/to/dir').u('sub/dir')", async () => {
    const tst = await u().u('test')
    expect(`${tst}`).to.equal(`${tstDir}`)
  })
  it("u('/path/to/dir').u('..')", async () => {
    const tst = await u(`${tstDir}`).u('..')
    expect(`${tst}`).to.equal(`${process.cwd()}`)
  })
  it("u('./path/to/dir').path.name", async () => {
    expect(`${u(`${tstDir}`).path.name}`).to.equal('test')
  })
  it("u('./path/to/fileOrDir').parent", async () => {
    const parent = await u(`${tstDir}`).parent
    expect(`${parent}`).to.equal(`${cwd}`)
  })

  it("u('./path/to/fileOrDir').stat()", async () => {
    const tst = await expect(u(`${tstDir}`).stat()).to.be.fulfilled
    console.log(tst.toJSON())
  })

  it("u('./path/to/fileOrDir').exists", async () => {
    expect(await u(`${tstDir}`).exists).to.be.true
  })
  it("u('./path/to/dir').addDirectory('newDir')", async () => {
    await u(`${tstDir}/newDirA`).delete(true, undefined, true)
    await expect(u(`${tstDir}`).addDirectory('newDirA')).to.be.fulfilled
    expect(await u(`${tstDir}/newDirA`).exists).to.be.true
  })
  it("u('./path/to/dir').addDirectory('newDir/nextDir')", async () => {
    await u(`${tstDir}/newDirB`).delete(true, undefined, true)
    const arr = await expect(u(`${tstDir}`).addDirectory('newDirB/nextDir')).to
      .be.fulfilled
    expect(arr.length).to.equal(2)
  })
  it("u('./path/to/dir').addDirectory(['a','b','c'])", async () => {
    await u(`${tstDir}/a`).delete(true, undefined, true)
    await u(`${tstDir}/b`).delete(true, undefined, true)
    await u(`${tstDir}/c`).delete(true, undefined, true)
    await expect(u(`${tstDir}`).addDirectory(['a', 'b', 'c'])).to.be.fulfilled
  })
  it("u('./path/to/dir').addFile('newFile.txt','content')", async () => {
    await u(`${tstDir}/newFileA.txt`).delete(true, undefined, true)
    await expect(u(`${tstDir}`).addFile('newFileA.txt', 'content')).to.be
      .fulfilled
  })
  it("u('./path/to/dirOrFile').touch()", async () => {
    await expect(u(`${tstDir}`).touch()).to.be.fulfilled
  })
  it("u('./path/to/dir').rename('folderX')", async () => {
    await u(`${tstDir}/newFileB.txt`).delete(true, undefined, true)
    await u(`${tstDir}/renFile.txt`).delete(true, undefined, true)
    await u(`${tstDir}/newFolderB`).delete(true, undefined, true)
    await u(`${tstDir}/renFolderB`).delete(true, undefined, true)
    const nFile = await u(`${tstDir}`).addFile('newFileB.txt')
    await expect(u(`${nFile}`).rename('renFile.txt')).to.be.fulfilled
    const newFolderB = await u(`${tstDir}`).addDirectory('newFolderB')
    await expect(u(`${newFolderB}`).rename('renFolderB')).to.be.fulfilled
  })
  it("u('./path/to/source').copyTo('/path/to/dest')", async () => {
    await u(`${tstDir}/source`).delete(true, undefined, true)
    await u(`${tstDir}/dest`).delete(true, undefined, true)
    const source = await u(`${tstDir}`).addDirectory('source/dest')
    const dest = await expect(u(`${source[1]}`).copyTo(`${tstDir}`)).to.be
      .fulfilled
    expect(`${dest}`).to.equal(`${tstDir}/dest`)
    expect(await dest.exists).to.be.true
  })
  it("u('./path/to/source').copyTo('/path/to/dest', CP_TYPE.overwrite)", async () => {
    await u(`${tstDir}/sourceA`).delete(true, undefined, true)
    await u(`${tstDir}/destA`).delete(true, undefined, true)
    await u(`${tstDir}/DestAFile`).delete(true, undefined, true)
    const destA = await tstDir.addDirectory('destA')
    await destA.addFile('DestAFile')
    const sourceFile = await tstDir.addFile('DestAFile')
    await expect(u(`${sourceFile}`).copyTo(`${tstDir}`)).to.be.rejected
    await expect(u(`${sourceFile}`).copyTo(`${tstDir}`, CP_TYPE.overwrite)).to
      .be.fulfilled
  })
  it("u('./path/to/source').moveTo('/path/to/dest')", async () => {
    await u(`${tstDir}/sourceB`).delete(true, undefined, true)
    await u(`${tstDir}/destB`).delete(true, undefined, true)
    const sourceB = await tstDir.addDirectory('sourceB/destB')
    const destB = await expect(u(`${sourceB[1]}`).moveTo(`${tstDir}`)).to.be
      .fulfilled
    expect(`${destB}`).to.equal(`${tstDir}/destB`)
    expect(await destB.exists).to.be.true
  })
  it("u('./path/to/source').moveTo('/path/to/dest', CP_TYPE.overwrite)", async () => {
    await u(`${tstDir}/sourceC`).delete(true, undefined, true)
    await u(`${tstDir}/sourceCFile`).delete(true, undefined, true)
    const sourceC = await tstDir.addDirectory('sourceC')
    await tstDir.addFile('sourceCFile')
    const sourceCFile = await sourceC.addFile('sourceCFile')
    await expect(u(`${sourceCFile}`).moveTo(tstDir)).to.be.rejected
    await expect(u(`${sourceCFile}`).moveTo(tstDir, CP_TYPE.overwrite)).to.be
      .fulfilled
  })
  it("u('./path/to/source').delete()", async () => {
    await u(`${tstDir}/ToDel`).delete(true, undefined, true)
    const ToDel = await tstDir.addDirectory('ToDel/N2')
    await expect(u(`${ToDel[0]}`).delete()).to.be.rejected
    await expect(u(`${ToDel[1]}`).delete()).to.be.fulfilled
  })
  it("u('./path/to/source').delete(true)", async () => {
    await u(`${tstDir}/ToDel2`).delete(true, undefined, true)
    const ND = await tstDir.addDirectory('ToDel2/N2')
    await expect(u(`${ND[0]}`).delete(true)).to.be.fulfilled
  })
  it("u('./path/to/source').trash()", async () => {
    await u(`${tstDir}/ToTrash`).delete(true, undefined, true)
    const ND = await tstDir.addDirectory('ToTrash/N2')
    await expect(u(`${ND[0]}`).trash()).to.be.fulfilled
  })

  it('server.emptyTrash()', async () => {
    await expect(server.emptyTrash()).to.be.fulfilled
  })
  it("u('./path').cloneAttrs(fsObject or path)", async () => {
    await u(`${tstDir}/CloneA`).delete(true, undefined, true)
    await u(`${tstDir}/CloneB`).delete(true, undefined, true)
    const NA = await tstDir.addDirectory([['CloneA'], ['CloneB']])
    await expect(u(`${NA[0][0]}`).cloneAttrs(NA[1][0])).to.be.fulfilled
  })
  it("u('./path/to/source').type", async () => {
    expect(`${await u().type}`).to.equal('directory')
  })
  it("u('./path/to/source').permissions", async () => {
    expect(`${await u(`${tstDir}`).permissions}`).to.match(/\d\d\d\d/)
    const pms = await u(`${tstDir}`).stat()
    expect(pms.permissions.octal).to.match(/\d\d\d\d/)
    expect(await u(`${tstDir}`).accessRights).to.match(/\d\d\d\d/)
  })
  it("u('./path/to/source').permissions.symbol", async () => {
    await tstDir.stat()
    expect(tstDir.permissions.symbol).to.match(/[-rwx]{12}/)
  })
  it("u('./path/to/source').setPermissions('a+rwx')", async () => {
    await u(`${tstDir}/setPerm`).delete(true, undefined, true)
    const N1 = await tstDir.addDirectory('setPerm')
    await expect(N1.setPermissions('a+rwx')).to.be.fulfilled
  })
  it("u('./path/to/source').user", async () => {
    await tstDir.stat()
    expect(`${tstDir.user}`).to.equal(process.env.USER)
    expect(tstDir.user.name).to.equal(process.env.USER)
  })
  it("u('./path/to/source').setUser('bob')", async () => {
    await u(`${tstDir}/userDir`).delete(true, undefined, true)
    const N1 = await tstDir.addDirectory('userDir')
    await expect(N1.setUser(process.env.USER)).to.be.fulfilled
  })
  it("u('./path/to/source').group", async () => {
    await tstDir.stat()
    expect(`${tstDir.group}`).to.be.string
    expect(tstDir.group.name).to.be.string
  })
  it("u('./path/to/source').setGroup('group')", async () => {
    await u(`${tstDir}/setGrp`).delete(true, undefined, true)
    const setGrp = await tstDir.addDirectory('setGrp')
    const currentGrp = await server.users.currentGroup
    await expect(setGrp.setGroup(currentGrp)).to.be.fulfilled
  })
  it("u('./path/to/source').linkTo('/path/to/symlink')", async () => {
    await u(`${tstDir}/simlnk.txt`).delete(true, undefined, true)
    await u(`${tstDir}/simlnkTarget.txt`).delete(true, undefined, true)
    await tstDir.addFile('simlnkTarget.txt', '')
    await expect(u(`${tstDir}/simlnk.txt`).linkTo(`${tstDir}/simlnkTarget.txt`))
      .to.be.fulfilled
  })
  it("u('./path/to/symlink').linkTarget", async () => {
    await u(`${tstDir}/simlnkB.txt`).delete(true, undefined, true)
    await u(`${tstDir}/simlnkTargetB.txt`).delete(true, undefined, true)
    await tstDir.addFile('simlnkTargetB.txt', '')
    const sym = await expect(
      u(`${tstDir}/simlnkB.txt`).linkTo(`${tstDir}/simlnkTargetB.txt`)
    ).to.be.fulfilled
    expect(`${await sym.linkTarget}`).to.equal(`${tstDir}/simlnkTargetB.txt`)
  })

  it("u('./path/to/symlink').linkEndTarget", async () => {
    await u(`${tstDir}/simSourceX1.txt`).delete(true, undefined, true)
    await u(`${tstDir}/simlnkX1.txt`).delete(true, undefined, true)
    await u(`${tstDir}/simlnkX2.txt`).delete(true, undefined, true)
    await tstDir.addFile('simSourceX1.txt', '')
    await u(`${tstDir}/simlnkX1.txt`).linkTo(`${tstDir}/simSourceX1.txt`)
    await u(`${tstDir}/simlnkX2.txt`).linkTo(`${tstDir}/simlnkX1.txt`)

    expect(`${await u(`${tstDir}/simlnkX2.txt`).linkEndTarget}`).to.equal(
      `${tstDir}/simSourceX1.txt`
    )
  })
  it("u('./path/to/dir').size", async () => {
    // await cwd.stat(true, true, true)
    const size1 = await u().size
    const size2 = await u(`${cwd}/package.json`).size
    expect(`${size1}`).to.match(/^[\dKTGMB,\.]+$/)
    expect(`${size2}`).to.match(/^[\dKTGMB,\.]+$/)
  })
  it("u('./path/to/file').read()", async () => {
    await u(`${tstDir}/newFileToRead.txt`).delete(true, undefined, true)
    const F1 = u(`${tstDir}/newFileToRead.txt`)
    await expect(F1.write('ContentOfFile')).to.be.fulfilled
    const content = await expect(F1.read()).to.be.fulfilled
    expect(content).to.equal('ContentOfFile')
  })
  it("u('./path/to/file').write(content)", async () => {
    await u(`${tstDir}/newFileToWrite.txt`).delete(true, undefined, true)

    const F1 = u(`${tstDir}/newFileToWrite.txt`)
    await expect(F1.write('ContentOfFile')).to.be.fulfilled
    const content = await expect(F1.read()).to.be.fulfilled
    expect(content).to.equal('ContentOfFile')
  })
  it("u('./path/to/file').append(content)", async () => {
    await u(`${tstDir}/fileToAppendTo.txt`).delete(true, undefined, true)

    const F1 = u(`${tstDir}/fileToAppendTo.txt`)
    await expect(F1.write('ContentOfFile')).to.be.fulfilled
    await expect(F1.append('MORE')).to.be.fulfilled
    const content = await expect(F1.read()).to.be.fulfilled
    expect(content).to.equal('ContentOfFileMORE')
  })
  it("u('./path/to/dir').find.byName('match')", async () => {
    await u(`${tstDir}/match`).delete(true, undefined, true)
    await u(`${tstDir}/unMatch`).delete(true, undefined, true)
    await tstDir.addFile('match')
    await tstDir.addFile('unMatch')
    const find = await u(`${tstDir}`).find.byName('match')
    expect(find.length).to.equal(1)
    expect(find[0].path.base).to.equal('match')
  })
  it("u('./path/to/dir').find.byRegEx('regex')", async () => {
    await u(`${tstDir}/filexyz.doc`).delete(true, undefined, true)
    await u(`${tstDir}/filexyz1.doc`).delete(true, undefined, true)
    await tstDir.addFile('filexyz.doc')
    await tstDir.addFile('filexyz1.doc')
    const find = await u(`${tstDir}`).find.byRegEx('f.*xyz*..doc')
    expect(find.length).to.equal(2)
    expect(find[0].path.base).to.equal('filexyz.doc')
  })

  it("sh('some shell cmd;')", async () => {
    const res = await sh('echo HELLO;')
    expect(res.output).to.equal('HELLO\n')
  })

  it('server.users.getUser()', async () => {
    expect(`${await server.users.getUser()}`).to.be.equal(process.env.USER)
  })

  it('server.pwd', async () => {
    expect(`${await server.pwd}`).to.be.equal(process.cwd())
  })
  it("u('new/working/dir').cd()", async () => {
    const tmpShell = new ShellHarness()
    const tmpDir = u(tstDir, tmpShell)
    expect(`${await tmpDir.executionContext.pwd}`).to.be.equal(process.cwd())
    expect(`${await u(tstDir, tmpShell).cd()}`).to.be.equal(`${tstDir}`)
    expect(`${await tmpDir.executionContext.pwd}`).to.be.equal(`${tstDir}`)
    tmpShell.close()
  })
})

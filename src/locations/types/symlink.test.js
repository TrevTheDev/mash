/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Server, {u} from '../../server'

chai.use(chaiAsPromised)

const {expect} = chai

describe('symlinks', () => {
  let tstDir
  let cwd
  before(async () => {
    cwd = u()
    tstDir = await cwd.addDirectory('test', true)
    // await tstDir.delete(true)
    // tstDir = await cwd.addDirectory('test', true)
  })
  after(() => {
    Server.instance.close()
  })

  it('can create a symlink', async () => {
    await u(`${tstDir}/symlinkS1`).delete(true, undefined, true)
    await u(`${tstDir}/DirSource`).delete(true, undefined, true)
    const DirSource = await tstDir.addDirectory('DirSource')
    const symLink = u(`${tstDir}/symlinkS1`)
    const res = await expect(symLink.linkTo(DirSource)).to.be.fulfilled
    expect(res.constructor.name).to.equal('Symlink')
    expect(res.state).to.equal('loadable')
    await expect(res.stat()).to.be.fulfilled
    expect(res.constructor.name).to.equal('Symlink')
    expect(`${res}`).to.equal(`${symLink}`)
    expect(`${await res.linkTarget}`).to.equal(`${DirSource}`)
    expect(`${res.paths.symlinkTargetPath}`).to.equal(`${DirSource}`)
  })

  it('can stat a symlink', async () => {
    await u(`${tstDir}/symlinkS2`).delete(true, undefined, true)
    await u(`${tstDir}/DirSource2`).delete(true, undefined, true)
    const DirSource2 = await tstDir.addDirectory('DirSource2')
    const symLink = u(`${tstDir}/symlinkS2`)
    await symLink.linkTo(DirSource2)

    await symLink.stat()

    const anotherSymLink = u(`${tstDir}/symlinkS2`)

    await anotherSymLink.stat(true, true, true)

    expect(`${anotherSymLink.paths.requestedPath}`).to.equal(
      `${tstDir}/symlinkS2`
    )

    await expect(anotherSymLink.stat(true, true, true)).to.be.fulfilled
    expect(anotherSymLink.constructor.name).to.equal('Symlink')
    expect(`${anotherSymLink}`).to.equal(`${tstDir}/symlinkS2`)
    expect(`${anotherSymLink.linkTarget}`).to.equal(`${DirSource2}`)
  })
  it('can delete a symlink', async () => {
    await u(`${tstDir}/symlinkS3`).delete(true, undefined, true)
    await u(`${tstDir}/DirSource3`).delete(true, undefined, true)

    const DirSource3 = await tstDir.addDirectory('DirSource3')
    const symlinkS3 = u(`${tstDir}/symlinkS3`)
    await symlinkS3.linkTo(DirSource3)

    const anotherSymLink = u(`${tstDir}/symlinkS3`)
    await anotherSymLink.delete()

    expect(await symlinkS3.exists).to.be.false
    expect(await DirSource3.exists).to.be.true
  })
  it('can change a symlink', async () => {
    await u(`${tstDir}/DirSource4`).delete(true, undefined, true)
    await u(`${tstDir}/DirSource5`).delete(true, undefined, true)
    await u(`${tstDir}/symlinkS5`).delete(true, undefined, true)

    const DirSource4 = await tstDir.addDirectory('DirSource4')
    const DirSource5 = await tstDir.addDirectory('DirSource5')
    const symlinkS5 = u(`${tstDir}/symlinkS5`)
    await symlinkS5.linkTo(DirSource4)
    // await expect(symlinkS5.linkTo(DirSource5)).to.be.rejected
    await expect(symlinkS5.linkTo(DirSource5)).to.be.fulfilled

    const anotherSymLink = u(`${tstDir}/symlinkS5`)
    await anotherSymLink.stat(true, false, false)
    expect(`${anotherSymLink}`).to.equal(`${tstDir}/symlinkS5`)
    expect(`${anotherSymLink.linkTarget}`).to.equal(`${DirSource5}`)
  })

  it('advance symlink', async () => {
    await u(`${tstDir}/DirSource6`).delete(true, undefined, true)
    await u(`${tstDir}/DirSource7`).delete(true, undefined, true)
    await u(`${tstDir}/FileSource6`).delete(true, undefined, true)
    await u(`${tstDir}/FileSource7`).delete(true, undefined, true)
    await u(`${tstDir}/noFile`).delete(true, undefined, true)

    const DirSource6 = await tstDir.addDirectory('DirSource6')
    const DirSource7 = await tstDir.addDirectory('DirSource7')
    const FileSource6 = await tstDir.addFile('FileSource6')
    const FileSource7 = await tstDir.addFile('FileSource7')
    const noFile = u(`${tstDir}/noFile`)
    const tmp = noFile.linkTo(FileSource6)
    let noFileSymLink = await tmp
    expect(await u(`${tstDir}/noFile`).exists).to.be.true
    expect(noFileSymLink.constructor.name).to.equal('Symlink')
    expect(noFileSymLink.state).to.equal('loadable')
    let target = await noFile.linkTarget
    // await target.stat(true, false, false)
    expect(target.constructor.name).to.equal('File')
    expect(`${target}`).to.equal(`${tstDir}/FileSource6`)

    await noFileSymLink.delete()

    noFileSymLink = await noFile.linkTo(DirSource6)
    expect(await u(`${tstDir}/noFile`).exists).to.be.true

    target = await noFile.linkTarget
    // await target.stat(true, false, false)
    expect(target.constructor.name).to.equal('Directory')
    expect(`${target}`).to.equal(`${tstDir}/DirSource6`)

    await noFileSymLink.delete()

    await expect(FileSource7.linkTo(DirSource6)).to.be.rejected

    await FileSource7.delete()
    const SymSource7 = await u(`${tstDir}/FileSource7`)

    await expect(SymSource7.linkTo(DirSource6)).to.be.fulfilled
    expect(await SymSource7.exists).to.be.true
    target = await SymSource7.linkTarget
    await target.stat(true, false, false)
    expect(target.constructor.name).to.equal('Directory')
    expect(`${target}`).to.equal(`${tstDir}/DirSource6`)

    await expect(DirSource7).to.not.have.property('linkTo')

    await DirSource7.delete()
    const SymDirSource7 = await u(`${tstDir}/DirSource7`)

    await expect(SymDirSource7.linkTo(FileSource6, true)).to.be.fulfilled
    expect(await SymSource7.exists).to.be.true
    target = await SymDirSource7.linkTarget
    await target.stat(true, false, false)
    expect(target.constructor.name).to.equal('File')
    expect(`${target}`).to.equal(`${tstDir}/FileSource6`)

    // await expect(SymDirSource7.linkTo(SymSource7)).to.be.rejected
    // await u(`${tstDir}/DirSource7`).delete()

    await expect(SymDirSource7.linkTo(SymSource7)).to.be.fulfilled
    expect(await SymSource7.exists).to.be.true
    target = await SymSource7.linkTarget
    await target.stat(true, false, false)
    expect(target.constructor.name).to.equal('Directory')
    expect(`${target}`).to.equal(`${tstDir}/DirSource6`)
  })

  it('interactions with symlinks', async () => {
    await u(`${tstDir}/DirSource8`).delete(true, undefined, true)
    await u(`${tstDir}/SimLink8`).delete(true, undefined, true)

    const DirSource8 = await tstDir.addDirectory('DirSource8')
    const SimLink8 = u(`${tstDir}/SimLink8`)
    await SimLink8.linkTo(DirSource8)
    await SimLink8.addFile('HELLO', 'HELLO')
    expect(await u(`${tstDir}/SimLink8/HELLO`).exists).to.be.true
    expect(await u(`${tstDir}/DirSource8/HELLO`).exists).to.be.true
    const content = await expect(SimLink8.content).to.be.fulfilled
    expect(content.length).to.equal(1)
  })

  it('symlink chains', async () => {
    await u(`${tstDir}/ChainSource`).delete(true, undefined, true)
    await u(`${tstDir}/ChainLink1`).delete(true, undefined, true)
    await u(`${tstDir}/ChainLink2`).delete(true, undefined, true)
    await u(`${tstDir}/ChainLink3`).delete(true, undefined, true)

    const ChainSource = await tstDir.addDirectory('ChainSource')
    const ChainLink1 = u(`${tstDir}/ChainLink1`)
    await ChainLink1.linkTo(ChainSource)
    const ChainLink2 = u(`${tstDir}/ChainLink2`)
    await ChainLink2.linkTo(ChainLink1)
    const ChainLink3 = u(`${tstDir}/ChainLink3`)
    await ChainLink3.linkTo(ChainLink2)

    await ChainLink3.addFile('HELLO', 'HELLO')
    expect(await u(`${tstDir}/ChainSource/HELLO`).exists).to.be.true

    await ChainLink3.stat(true, true, true)

    expect(`${ChainLink3.linkTarget}`).to.equal(`${ChainLink2}`)
    expect(`${ChainLink3.linkEndTarget}`).to.equal(`${ChainSource}`)
    expect(`${ChainLink3.linkTarget.linkTarget}`).to.equal(`${ChainLink1}`)
    expect(`${ChainLink3.linkTarget.linkTarget.linkTarget}`).to.equal(
      `${ChainSource}`
    )
    expect(ChainLink3.linkTarget.linkTarget.linkTarget.linkTarget).to.be
      .undefined

    await u(`${tstDir}/ChainLink2`).delete()
    await expect(ChainLink3.stat(true, true, true)).to.be.rejected
    await expect(ChainLink3.stat(true, true, false)).to.be.fulfilled
    expect(`${ChainLink3.linkTarget}`).to.equal(`${ChainLink2}`)
    expect(ChainLink3.linkEndTarget).to.be.undefined
  })
})

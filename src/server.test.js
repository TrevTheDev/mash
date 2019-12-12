/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiArrays from 'chai-arrays'
import Server, {u, sh, ShellHarness} from './server'
import {FILE_TYPE_ENUMS} from './util/globals'

chai.use(chaiAsPromised)
chai.use(chaiArrays)

const {expect} = chai

describe('posix fs object', () => {
  let server
  before(() => {
    server = Server.instance || new Server()
  })
  after(() => {
    if (Server.instance) Server.instance.close()
  })
  describe('basics', () => {
    it('reads directory content and returns array', async () => {
      const content = await expect(u().content).to.be.fulfilled
      expect(content).to.be.array()
    })
    it('returns cwd if no arguments are supplied', async () => {
      const cwd = u()
      expect(cwd.state).to.equal('init')
      expect(cwd.constructor.name).to.equal('FsObject')
      expect(`${cwd}`).to.equal(process.cwd())
      await expect(cwd.stat()).to.be.fulfilled
      expect(`${cwd}`).to.equal(process.cwd())
      expect(cwd.constructor.name).to.equal('Directory')
      expect(cwd.state).to.equal('loaded')
    })
    it('promise rejects if path does not exist', async () => {
      const dne = u('/does/not/exist')
      await expect(dne.stat()).to.be.rejectedWith(
        'path not found: /does/not/exist'
      )
      await expect(dne.content).to.be.rejectedWith(
        'stat: directory not found: /does/not/exist'
      )
    })
    it('supports base64 encoded file urls', async () => {
      await expect(
        u('file%3A%2F%2Fdoes%2Fnot%2Fexist').stat()
      ).to.be.rejectedWith('path not found: /does/not/exist')
    })
    it('supports relative urls', async () => {
      const dne = await expect(u('./').stat()).to.be.fulfilled
      expect(`${dne}`).to.equal(process.cwd())
    })
    // it('does not supports relative urls base64 encoded', () => {
    //   // const rej = u('file%3A%2F%2F.%2F')
    //   expect(() => u('file%3A%2F%2F.%2F')).to.throw(
    //     'invalid file URI: file%3A%2F%2F.%2F'
    //   )
    // })
    it('supports file urls', async () => {
      const cwd = await expect(u(`file:/${process.cwd()}`).stat()).to.be
        .fulfilled
      expect(`${cwd}`).to.equal(process.cwd())
    })
    it('supports file urls that include localhost', async () => {
      const cwd = await expect(u(`file://localhost/${process.cwd()}`).stat()).to
        .be.fulfilled
      expect(`${cwd}`).to.equal(process.cwd())
    })
    it('supports relative dots in path', async () => {
      const home = await expect(u(`/home/../home`).stat()).to.be.fulfilled
      expect(`${home}`).to.equal('/home')
    })

    it('can run intermediate', async () => {
      await u().addDirectory('test', true)
      const runIntermediate = await expect(
        u('./test').addDirectory('runIntermediate', true)
      ).to.be.fulfilled
      await expect(runIntermediate.delete(true)).to.be.fulfilled
    })
    it('reads badfiles dir and returns an array of all fs objects', async () => {
      const cont = await u(`${u()}/badfiles`).dir()
      expect(cont).to.be.array()
    })
    it('returns an array of all fs objects', async () => {
      const cwd = u()
      const fsArr = u([`${cwd}`, `${cwd}/badfiles`, `${cwd}/test`])
      expect(fsArr.constructor.name).to.equal('FSObjectArray')
      expect(`${fsArr[0]}`).to.equal(`${cwd}`)
      expect(`${fsArr[1]}`).to.equal(`${cwd}/badfiles`)
      expect(`${fsArr[2]}`).to.equal(`${cwd}/test`)
    })
  })
  describe('intermediate', () => {
    let tstDir
    let cwd
    before(async () => {
      cwd = u()
      // tstDir = await u().u('test')
      // await tstDir.delete(true, undefined, true)
      tstDir = await cwd.addDirectory('test', true)
    })
    after(async () => {
      // await tstDir.delete(true)
    })
    it('can add another directory', async () => {
      await u(`${cwd}/test/newDir`).delete(true, undefined, true)
      const newDir = await tstDir.addDirectory('newDir')
      expect(`${newDir}`).to.equal(`${tstDir}/newDir`)
      expect(newDir.type).to.equal(FILE_TYPE_ENUMS.directory)
    })
    it('can add directories based on path seg/seg/seg', async () => {
      await u(`${cwd}/test/Seg1`).delete(true, undefined, true)
      const newDirs = await tstDir.addDirectory('Seg1/Seg2/Seg3')
      expect(newDirs.constructor.name).to.equal('FSObjectArray')
      expect(newDirs.length).to.equal(3)
      expect(`${newDirs[0]}`).to.equal(`${tstDir}/Seg1`)
      expect(`${newDirs[1]}`).to.equal(`${tstDir}/Seg1/Seg2`)
      expect(`${newDirs[2]}`).to.equal(`${tstDir}/Seg1/Seg2/Seg3`)
      expect(newDirs[2].type).to.equal(FILE_TYPE_ENUMS.directory)
      await expect(newDirs[2].stat()).to.be.fulfilled
    })
    it('can add array of directories', async () => {
      await u(`${cwd}/test/arr1`).delete(true, undefined, true)
      await u(`${cwd}/test/arr2`).delete(true, undefined, true)
      await u(`${cwd}/test/arr3`).delete(true, undefined, true)
      const newDirs = await tstDir.addDirectory([
        ['arr1', 'xArr1', 'xArr2'],
        ['arr2'],
        ['arr3']
      ])
      expect(`${newDirs[0][0]}`).to.equal(`${process.cwd()}/test/arr1`)
      expect(`${newDirs[0][1]}`).to.equal(`${process.cwd()}/test/arr1/xArr1`)
      expect(`${newDirs[0][2]}`).to.equal(
        `${process.cwd()}/test/arr1/xArr1/xArr2`
      )
      expect(`${newDirs[1][0]}`).to.equal(`${process.cwd()}/test/arr2`)
      expect(`${newDirs[2][0]}`).to.equal(`${process.cwd()}/test/arr3`)
    })
    it('throws an error if directory exists, unless enabled', async () => {
      await u(`${cwd}/test/D1`).delete(true, undefined, true)
      await expect(tstDir.addDirectory(['D1', 'DB1', 'DB2']), true).to.be
        .fulfilled
      await expect(tstDir.addDirectory('D1', true)).to.be.fulfilled
      await expect(tstDir.addDirectory(['D1', 'DB1', 'DB2'])).to.be.rejected
      await expect(tstDir.addDirectory('D1')).to.be.rejected
    })
    it('returns an array of fs objects without having to use await', async () => {
      const cont = await tstDir.content
      expect(cont).to.be.array()
    })
    it('can add multiple directories based on path', async () => {
      await u(`${tstDir}/multiDirF1`).delete(true, undefined, true)
      const fs = await tstDir.addDirectory('multiDirF1', true)
      expect(`${fs}`).to.equal(`${tstDir}/multiDirF1`)
      expect(fs.type).to.equal(FILE_TYPE_ENUMS.directory)
    })
    it('deletes directories', async () => {
      await u(`${cwd}/test/xG1`).delete(true, undefined, true)
      await u(`${cwd}/test/xG2`).delete(true, undefined, true)
      await u(`${cwd}/test/xG3`).delete(true, undefined, true)
      await tstDir.addDirectory([['xG1', 'xB1', 'xB2'], ['xG2'], ['xG3']], true)
      const dir = u(`${process.cwd()}/test/xG1`)
      await expect(dir.delete()).to.be.rejected
      const res = await expect(dir.delete(true)).to.be.fulfilled
      expect(res).to.equal(true)
      expect(dir.constructor.name).to.equal('Object')
      await expect(u(`${process.cwd()}/test/xG1`).stat()).to.be.rejected
      await expect(u(`${process.cwd()}/test/xG2`).delete()).to.be.fulfilled
      await expect(u(`${process.cwd()}/test/xG3`).delete()).to.be.fulfilled
    })
  })
  describe('sundry', () => {
    let tstDir
    let cwd
    beforeEach(async () => {
      cwd = u()
      tstDir = await cwd.addDirectory('test', true)
      // await tstDir.delete(true)
      // tstDir = await cwd.addDirectory('test', true)
    })
    it('can cd and pwd', async () => {
      expect(`${await server.pwd}`).to.equal(`${cwd}`)
      const tmpShell = new ShellHarness()
      const tmpDir = u(tstDir, tmpShell)
      expect(`${await tmpDir.executionContext.pwd}`).to.be.equal(process.cwd())
      expect(`${await tmpDir.cd()}`).to.be.equal(`${tstDir}`)
      expect(`${await tmpDir.executionContext.pwd}`).to.be.equal(`${tstDir}`)
      tmpShell.close()
    })
    it('can cd and pwd with multiple shells', async () => {
      const multiShell = new ShellHarness({
        numberOfProcesses: 5
      })
      const ms = u('', multiShell)
      expect(`${await ms.executionContext.pwd}`).to.equal(`${cwd}`)
      const msTest = await expect(u(`${tstDir}`, multiShell).cd()).to.be
        .fulfilled
      expect(`${await msTest.executionContext.pwd}`).to.equal(`${tstDir}`)
      multiShell.close()
    })
    it('can toJSON', async () => {
      await u(`${cwd}/test/file.txt`).delete(true, undefined, true)
      const newFile = await tstDir.addFile('file.txt', 'content')
      await newFile.stat()
      // console.log(newFile.toJSON())
      await cwd.stat()
      // console.log(cwd.toJSON())
      await cwd.dir(false, false, false)
      // console.log(cwd.toJSON(true))
      await cwd.dir(true, false, false)
      // console.log(cwd.toJSON())
      await cwd.dir(true, true, true)
      // console.log(cwd.toJSON())
    })
    it('parallel run', async () => {
      await u(`${cwd}/test/many`).delete(true, undefined, true)
      const manyDir = await tstDir.addDirectory('many', true)
      const pms = [...Array(50).keys()].map(number => {
        return new Promise(async resolve => {
          const d = await manyDir.addDirectory(`D${number}`)
          // console.log(`D${number}`)
          const f = await d.addFile(`F${number}`, `F${number}`)
          // console.log(`F${number}`)
          await f.delete()
          await d.delete()
          // console.log(`P${number}`)
          resolve(true)
        })
      })
      await expect(Promise.all(pms)).to.be.fulfilled
    })
    it('lsattr,gio,size tests', async () => {
      await u(`${tstDir}/pop`).delete(true, undefined, true)
      await u(`${tstDir}/popSym`).delete(false, undefined, true)
      const pop = await tstDir.addDirectory('pop', true)
      await pop.addDirectory('d1', true)
      const file = await pop.addFile('file', 'CONTENT')
      const symD = await u(`${tstDir}/popSym`).linkTo(pop)
      const symF = await u(`${pop}/popF`).linkTo(file)
      await expect(pop.stat(true, true, true)).to.be.fulfilled
      expect(pop.size.fileCount.number === 2).to.be.true
      expect(pop.size.directoryCount.number === 2).to.be.true
      expect(pop.size.size.bytes > 0).to.be.true
      await expect(file.stat(true, true)).to.be.fulfilled
      expect(file.size.bytes > 0).to.be.true
      await expect(symD.stat(true, true, true)).to.be.fulfilled
      expect(symD.size.fileCount.number === 2).to.be.true
      expect(symD.size.directoryCount.number === 2).to.be.true
      expect(symD.size.size.bytes > 0).to.be.true
      await expect(symF.stat(true, true, true)).to.be.fulfilled
      expect(symF.size.bytes > 0).to.be.true
    })
    it('bad file names', async () => {
      await u(`${tstDir}/badIdeaPathNames`).delete(true, undefined, true)

      await tstDir.addDirectory(['badIdeaPathNames', 'D1', 'D2'], true)
      const wd = u(`${tstDir}/badIdeaPathNames`)
      const all = [...Array(31).keys()]
        .map(number => String.fromCharCode(number + 1))
        .join('')
      const badPaths = [
        'name with spaces',
        ' leading and trailing spaces ',
        '-name with -',
        '\nnew lines\nallowed',
        'dots.allowed',
        '.invisible',
        'meta(*,?[(\\)])&<>"*?:[]"<>|(){}&\'!;$',
        'as$as',
        all
      ]
      // eslint-disable-next-line no-restricted-syntax
      for (const badPath of badPaths) {
        let badFile = await expect(wd.addFile(badPath, 'DUMMY')).to.be.fulfilled
        badFile = u(`${badFile}`)
        expect(await badFile.exists).to.be.true
        await expect(badFile.stat(true, true, true)).to.be.fulfilled
        expect(`${badFile.parent}`).to.equal(`${wd}`)
        expect(`${badFile.path.base}`).to.equal(badPath)

        const res = await expect(badFile.read()).to.be.fulfilled
        expect(res).to.equal('DUMMY')

        await expect(badFile.setPermissions('777')).to.be.fulfilled
        await expect(badFile.setUser(process.env.USER)).to.be.fulfilled
        await expect(badFile.setGroup(`${await badFile.group}`)).to.be.fulfilled

        const badSymlink = await u(`${wd}/D1`).u(badPath)
        await badSymlink.linkTo(badFile)
        expect(`${await badSymlink.linkTarget}`).to.equal(`${badFile}`)
        const renamed = await badSymlink.rename('symlink')
        await renamed.delete()
        const copyBadFile = await badFile.moveTo(`${wd}/D1`)

        badFile = await wd.u(badPath)
        await expect(badFile.touch()).to.be.fulfilled

        await expect(copyBadFile.cloneAttrs(badFile)).to.be.fulfilled

        await expect(badFile.trash()).to.be.fulfilled
        await copyBadFile.delete()

        // console.log(badPath)
      }
    })
    it('change state appropriately', async () => {
      await u(`${tstDir}/stateTest`).delete(true, undefined, true)
      let dir = await tstDir.addDirectory('stateTest')
      expect(dir.state).to.equal('loadable')
      dir = u(`${tstDir}/stateTest`)
      expect(dir.state).to.equal('init')
      await dir.stat()
      expect(dir.state).to.equal('loaded')
      await dir.setPermissions('775')
      expect(dir.state).to.equal('outdated')
      await dir.setPermissions('777')
      await dir.stat()
      expect(dir.state).to.equal('loaded')
    })

    it('works with most posix file types', async () => {
      // TODO Block file(b) Character device file(c)
      await u(`${tstDir}/posixTypes`).delete(true, undefined, true)
      const dir = await tstDir.addDirectory('posixTypes')
      const file = await dir.addFile('file', 'content')
      await dir.addDirectory('directory')
      await u(`${dir}/directory/symlink`).linkTo(file)
      await sh('mkfifo test/posixTypes/fifo;')
      const pid = await sh(
        'nc -lkU ./test/posixTypes/aSocket.sock & printf $!;'
      )

      await dir.content

      await sh(`kill -9 ${pid.output};`)

      const dev = u('/dev')

      await dev.content

      await dir.delete(true)
    })

    it('finds files', async () => {
      // const xy = 10000000
      // let i = 0
      // let nArr = []
      // const startDate1 = new Date()
      // nArr = [...Array(xy).keys()].map(() => {
      //   return new Y()
      // })
      // const midDate1 = new Date()
      // console.log(midDate1 - startDate1)
      // nArr.forEach(y => {
      //   i += y.y
      // })
      // // console.log(i)
      // console.log(new Date() - midDate1)
      // i = 0
      // nArr = []
      // const startDate2 = new Date()
      // nArr = [...Array(xy).keys()].map(() => {
      //   return new Z()
      // })
      // const midDate2 = new Date()
      // console.log(midDate2 - startDate2)
      // nArr.forEach(z => {
      //   i += z.z
      // })
      // // console.log(i)
      // console.log(new Date() - midDate2)
      // await u(`${tstDir}/find`).delete(true, undefined, true)
      // const dir = await tstDir.addDirectory('find')
      // const file = await dir.addFile('a.txt', 'content')
      // await dir.addFile('a.doc', 'content')
      // await dir.addFile('.a.txt', 'content')
      // await dir.addFile('ad', 'content')
      // await dir.addFile('b.txt', 'content')
      // await dir.addDirectory('a')
      // await dir.addFile('a/a.txt', 'content')
      // await dir.addDirectory('b')
      // await u(`${dir}/c.txt`).linkTo(file)
      // await sh('mkfifo test/find/fifo;')
      // let find = await dir.find('*.txt')
      // expect(find.length === 5).to.be.true
      // find = await dir.find('a')
      // expect(find.length === 1).to.be.true
      // find = await dir.find('a*')
      // expect(find.length === 5).to.be.true
      // find = await dir.find('fifo')
      // expect(find.length === 1).to.be.true
      // await dir.delete(true)
    })
  })
})

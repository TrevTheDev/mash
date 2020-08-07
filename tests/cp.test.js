/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiArrays from 'chai-arrays'
import Server, { sh, ShellHarness, u } from '../src/server.js'
import { CP_TYPE } from '../src/util/globals.js'
import Rate from '../src/formatters/rate.js'

chai.use(chaiAsPromised)
chai.use(chaiArrays)

const { expect } = chai

describe('copy, move, rename and trash', () => {
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

  describe('copy', () => {
    it('copies a directory', async () => {
      await u(`${tstDir}/cpL1`).delete(true, undefined, true)
      await u(`${tstDir}/cpL2`).delete(true, undefined, true)

      await tstDir.addDirectory(['cpL1', 'cpL2', 'L3'], true)
      let L2 = u(`${tstDir}/cpL1/cpL2`)
      const L2C = await expect(L2.copyTo(tstDir)).to.be.fulfilled
      L2 = await L2.stat()
      expect(`${L2}`).to.equal(`${tstDir}/cpL1/cpL2`)
      expect(`${L2C}`).to.equal(`${tstDir}/cpL2`)
      expect(await L2C.exists).to.be.true
      expect(await u(`${tstDir}/cpL1/cpL2/L3`).exists).to.be.true
      expect(await u(`${tstDir}/cpL2/L3`).exists).to.be.true
    })

    it('copy fails to overwrite existing directory unless instructed', async () => {
      await u(`${tstDir}/ocpL1`).delete(true, undefined, true)
      await u(`${tstDir}/ocpL2`).delete(true, undefined, true)

      await tstDir.addDirectory(['ocpL1', 'ocpL2', 'L3', 'L4'], true)
      await tstDir.addDirectory(['ocpL2', 'L4'], true)
      const L2 = u(`${tstDir}/ocpL1/ocpL2`)

      const Dest = u(`${tstDir}/ocpL2`)

      await expect(L2.copyTo(tstDir)).rejectedWith(
        `copyTo: path already exists: ${Dest}`,
      )

      await expect(L2.copyTo(tstDir, 'dummy')).to.be.rejectedWith(
        'copyTo: invalid argument: copyType',
      )

      await expect(
        L2.copyTo(tstDir, CP_TYPE.askBeforeOverwrite, () => Promise.resolve('cancel')),
      ).to.be.rejectedWith('cancelled by user')

      let DestL3 = u(`${Dest}/L3`)
      expect(await DestL3.exists).to.be.false

      let res = await expect(L2.copyTo(tstDir, CP_TYPE.overwrite)).to.be
        .fulfilled
      expect(`${res}`).to.equal(`${Dest}`)
      expect(await DestL3.exists).to.be.true

      await DestL3.delete(true)

      res = await expect(
        L2.copyTo(tstDir, CP_TYPE.askBeforeOverwrite, () => Promise.resolve('yes')),
      ).to.be.fulfilled
      expect(`${res}`).to.equal(`${Dest}`)
      DestL3 = await u(`${Dest}/L3`)
      expect(await DestL3.exists).to.be.true

      // TODO: other copy type
    })

    it('copies a file', async () => {
      await u(`${tstDir}/cpyFL`).delete(true, undefined, true)
      await u(`${tstDir}/cpyFlTestFile.txt`).delete(true, undefined, true)

      const L1 = await tstDir.addDirectory('cpyFL')
      const file = await tstDir.addFile('cpyFlTestFile.txt')
      const nFile = await expect(file.copyTo(L1)).to.be.fulfilled
      expect(`${nFile}`).to.equal(`${tstDir}/cpyFL/cpyFlTestFile.txt`)
      expect(await nFile.exists).to.be.true
      expect(await file.exists).to.be.true
      await file.delete()
      await u(`${tstDir}/cpyFL/cpyFlTestFile.txt`).copyTo(`${tstDir}`)
      expect(await u(`${tstDir}/cpyFlTestFile.txt`).exists).to.be.true
    })

    it('copies a large file', async () => {
      await u(`${tstDir}/cpyLF`).delete(true, undefined, true)
      await u(`${tstDir}/cpyLargeFile.iso`).delete(true, undefined, true)

      const cpyLF = await tstDir.addDirectory('cpyLF')
      await sh(`dd if=/dev/zero of=${tstDir}/cpyLargeFile.iso count=1024 bs=1048576;`)
      const largeFile = u(`${tstDir}/cpyLargeFile.iso`)
      const copyCmd = largeFile.copyTo(cpyLF)
      copyCmd.on('progressUpdate', (progressTracker) => {
        console.log(`targetBytes: ${progressTracker.targetBytes}`)
        console.log(`bytesCompleted: ${progressTracker.bytesCompleted}`)
        console.log(`bytesRemaining: ${progressTracker.bytesRemaining}`)
        console.log(`progressFileCount: ${progressTracker.progressFileCount}`)
        console.log(`progressDirectoryCount: ${progressTracker.progressDirectoryCount}`)
        console.log(`percentageCompleted: ${progressTracker.percentageCompleted}`)
        console.log(
          `deltaRateOfCompletion: ${new Rate(
            progressTracker.deltaRateOfCompletion,
          )}`,
        )
        console.log(`rateOfCompletion: ${progressTracker.rateOfCompletion}`)
        console.log(`deltaETC: ${progressTracker.deltaETC}`)
        console.log(`ETC: ${progressTracker.ETC}`)
      })
      const nLargeFile = await expect(copyCmd).to.be.fulfilled
      expect(`${nLargeFile}`).to.equal(`${cpyLF}/cpyLargeFile.iso`)
      expect(await nLargeFile.exists).to.be.true
    })

    it('fails to overwrite existing file unless instructed', async () => {
      await u(`${tstDir}/orDir`).delete(true, undefined, true)
      await u(`${tstDir}/orTestFile.txt`).delete(true, undefined, true)

      const orDir = await tstDir.addDirectory('orDir')
      const file1 = u(`${tstDir}/orTestFile.txt`)
      await file1.write('123')
      const file2 = u(`${orDir}/orTestFile.txt`)
      await file2.write('345')
      await expect(file1.copyTo(orDir)).to.be.rejectedWith(
        `copyTo: path already exists: ${file2}`,
      )
      expect(await file1.read()).to.equal('123')
      expect(await file2.read()).to.equal('345')

      await expect(file1.copyTo(orDir, CP_TYPE.overwrite)).to.be.fulfilled

      expect(await file2.read()).to.equal('123')
      await file2.write('345', true)

      await expect(
        file1.copyTo(orDir, CP_TYPE.askBeforeOverwrite, (copyManager) => {
          expect(`${copyManager.progressReport.currentSourcePath}`).to.equal(`${file1}`)
          expect(`${copyManager.progressReport.currentDestinationDirectoryPath}`).to.equal(
            `${orDir}`,
          )
          return new Promise((resolve) => {
            setTimeout(() => resolve('no'), 20)
          })
        }),
      ).to.be.fulfilled

      expect(await file2.read()).to.equal('345')

      await expect(
        file1.copyTo(orDir, CP_TYPE.askBeforeOverwrite, () => Promise.resolve('none')),
      ).to.be.fulfilled

      expect(await file2.read()).to.equal('345')

      await expect(
        file1.copyTo(orDir, CP_TYPE.askBeforeOverwrite, () => Promise.resolve('yes')),
      ).to.be.fulfilled

      expect(await file2.read()).to.equal('123')
      await file2.write('345', true)

      await expect(
        file1.copyTo(orDir, CP_TYPE.askBeforeOverwrite, () => Promise.resolve('all')),
      ).to.be.fulfilled

      expect(await file2.read()).to.equal('123')
      await file2.write('345', true)

      await expect(
        file1.copyTo(orDir, CP_TYPE.askBeforeOverwrite, () => Promise.resolve('cancel')),
      ).to.be.rejectedWith('cancelled by user')

      expect(await file2.read()).to.equal('345')

      await expect(file1.copyTo(orDir, CP_TYPE.overwriteOlder)).to.be.fulfilled
      expect(await file2.read()).to.equal('345')

      await file1.write('678', true)

      await expect(file1.copyTo(orDir, CP_TYPE.overwriteOlder)).to.be.fulfilled

      expect(await file2.read()).to.equal('678')
    })

    it('copies a node folder', async () => {
      await u(`${tstDir}/node_modules`).delete(true, true, true)
      const nm = await cwd.u('node_modules')
      const copyCmd = nm.copyTo(tstDir)
      copyCmd.on('progressUpdate', (progressTracker) => {
        console.log(
          `targetBytes: ${progressTracker.targetBytes} bytesCompleted: ${progressTracker.bytesCompleted} bytesRemaining: ${progressTracker.bytesRemaining}`,
        )
        console.log(
          `targetDirectoryCount: ${progressTracker.targetDirectoryCount} progressDirectoryCount: ${progressTracker.progressDirectoryCount}`,
        )
        console.log(
          `targetFileCount: ${progressTracker.targetFileCount} progressFileCount: ${progressTracker.progressFileCount}`,
        )
        console.log(
          `percentageCompleted: ${progressTracker.percentageCompleted}`,
        )
        console.log(
          `deltaRateOfCompletion: ${progressTracker.deltaRateOfCompletion} rateOfCompletion: ${progressTracker.rateOfCompletion}`,
        )
        console.log(
          `deltaETC: ${progressTracker.deltaETC} ETC: ${progressTracker.ETC}`,
        )
        console.log(`source: ${progressTracker.currentSourcePath}`)
      })
      const nodeFiles = await expect(copyCmd).to.be.fulfilled
      console.log(nodeFiles.size)
    })

    it('it can merge copy two directories', async () => {
      await u(`${tstDir}/mergeL1`).delete(true, undefined, true)
      await u(`${tstDir}/mergeL2`).delete(true, undefined, true)

      await tstDir.addDirectory(['mergeL1', 'mergeL2', 'A1', 'A2', 'A3'])
      await tstDir.addDirectory(['mergeL2', ['B1', 'B2'], ['B3']])

      await expect(
        u(`${tstDir}/mergeL1/mergeL2`).copyTo(tstDir, CP_TYPE.overwrite),
      ).to.be.fulfilled

      await expect(u(`${tstDir}/mergeL1/mergeL2/A1`).stat()).to.be.fulfilled
      await expect(u(`${tstDir}/mergeL2/A1/A2/A3`).stat()).to.be.fulfilled
      await expect(u(`${tstDir}/mergeL2/B1`).stat()).to.be.fulfilled
    })
  })

  describe('move', () => {
    it('moves a directory', async () => {
      await u(`${tstDir}/moveL1`).delete(true, undefined, true)
      await u(`${tstDir}/moveL2`).delete(true, undefined, true)

      await tstDir.addDirectory(['moveL1', 'moveL2', 'L3'], true)
      const L2 = u(`${tstDir}/moveL1/moveL2`)
      const L2C = await expect(L2.moveTo(tstDir)).to.be.fulfilled
      expect(await L2.exists).to.be.false
      expect(`${L2C}`).to.equal(`${tstDir}/moveL2`)
      expect(await L2C.exists).to.be.true
      await expect(L2C.stat(false, false)).to.be.fulfilled
      expect(await u(`${tstDir}/moveL1/moveL2/L3`).exists).to.be.false
      expect(await u(`${tstDir}/moveL2/L3`).exists).to.be.true
    })

    it('move fails to overwrite existing directory unless instructed', async () => {
      await u(`${tstDir}/move2L1`).delete(true, undefined, true)
      await u(`${tstDir}/move2L2`).delete(true, undefined, true)

      await tstDir.addDirectory(['move2L1', 'move2L2', 'L3', 'L4'], true)
      await tstDir.addDirectory(['move2L2', 'L4'], true)
      const L1 = u(`${tstDir}/move2L1`)
      let L2 = u(`${tstDir}/move2L1/move2L2`)

      const Dest = u(`${tstDir}/move2L2`)

      await expect(L2.moveTo(tstDir)).rejectedWith(
        `moveTo: path already exists: ${Dest}`,
      )
      expect(await L2.exists).to.be.true

      await expect(L2.moveTo(tstDir, 'dummy')).to.be.rejectedWith(
        'moveTo: invalid argument: copyType',
      )
      expect(await L2.exists).to.be.true

      await expect(
        L2.moveTo(tstDir, CP_TYPE.askBeforeOverwrite, () => Promise.resolve('cancel')),
      ).to.be.rejectedWith('cancelled by user')
      expect(await L2.exists).to.be.true

      const DestL3 = u(`${Dest}/L3`)
      expect(await DestL3.exists).to.be.false

      let res = await expect(L2.moveTo(tstDir, CP_TYPE.overwrite)).to.be
        .fulfilled
      expect(`${res}`).to.equal(`${Dest}`)
      expect(await DestL3.exists).to.be.true

      L2 = u(`${tstDir}/move2L1/move2L2`)
      expect(await L2.exists).to.be.false

      await DestL3.delete(true)
      await L1.addDirectory(['move2L2', 'L3', 'L4'], true)

      res = await expect(
        L2.moveTo(tstDir, CP_TYPE.askBeforeOverwrite, () => Promise.resolve('yes')),
      ).to.be.fulfilled
      expect(`${res}`).to.equal(`${Dest}`)
      expect(await u(`${Dest}/L3`).exists).to.be.true

      // TODO: other copy type
    })

    it('moves a file', async () => {
      await u(`${tstDir}/moveDirC`).delete(true, undefined, true)
      await u(`${tstDir}/moveAFileC`).delete(true, undefined, true)

      const L1 = await tstDir.addDirectory('moveDirC')
      const file = await tstDir.addFile('moveAFileC')
      const nFile = await expect(file.moveTo(L1)).to.be.fulfilled
      expect(`${nFile}`).to.equal(`${tstDir}/moveDirC/moveAFileC`)
      expect(await nFile.exists).to.be.true
      expect(await file.exists).to.be.false
      expect(await u(`${tstDir}/moveAFileC`).exists).to.be.false
    })

    it('moves a large file', async () => {
      await u(`${tstDir}/moveDirD`).delete(true, undefined, true)
      await u(`${tstDir}/moveAFileD.iso`).delete(true, undefined, true)

      const L1 = await tstDir.addDirectory('moveDirD')
      await sh(
        `dd if=/dev/zero of=${tstDir}/moveAFileD.iso count=1024 bs=5048576;`,
      )
      const largeFile = u(`${tstDir}/moveAFileD.iso`)
      const copyCmd = largeFile.moveTo(L1)
      copyCmd.on('progressUpdate', (progressTracker) => {
        console.log(`targetBytes: ${progressTracker.targetBytes}`)
        console.log(`bytesCompleted: ${progressTracker.bytesCompleted}`)
        console.log(`bytesRemaining: ${progressTracker.bytesRemaining}`)
        console.log(`progressFileCount: ${progressTracker.progressFileCount}`)
        console.log(
          `progressDirectoryCount: ${progressTracker.progressDirectoryCount}`,
        )
        console.log(
          `percentageCompleted: ${progressTracker.percentageCompleted}`,
        )
        console.log(
          `deltaRateOfCompletion: ${progressTracker.deltaRateOfCompletion}`,
        )
        console.log(`rateOfCompletion: ${progressTracker.rateOfCompletion}`)
        console.log(`deltaETC: ${progressTracker.deltaETC}`)
        console.log(`ETC: ${progressTracker.ETC}`)
      })
      const nLargeFile = await expect(copyCmd).to.be.fulfilled
      expect(`${nLargeFile}`).to.equal(`${L1}/moveAFileD.iso`)
      expect(await nLargeFile.exists).to.be.true
      expect(await largeFile.exists).to.be.false
      expect(await u(`${tstDir}/moveAFileD.iso`).exists).to.be.false
    })
    it('it can merge move two directories', async () => {
      await u(`${tstDir}/mergeMove1`).delete(true, undefined, true)
      await u(`${tstDir}/mergeMove2`).delete(true, undefined, true)

      await tstDir.addDirectory(['mergeMove1', 'mergeMove2', 'A1', 'A2', 'A3'])
      await tstDir.addDirectory(['mergeMove2', ['B1', 'B2'], ['B3']])

      await expect(
        u(`${tstDir}/mergeMove1/mergeMove2`).moveTo(tstDir, CP_TYPE.overwrite),
      ).to.be.fulfilled

      expect(await u(`${tstDir}/mergeMove1/mergeMove2/A1`).exists).to.be.false
      expect(await u(`${tstDir}/mergeMove2/A1`).exists).to.be.true
      expect(await u(`${tstDir}/mergeMove2/B1`).exists).to.be.true
    })
  })
  describe('rename', () => {
    it('renames a directory', async () => {
      await u(`${tstDir}/renameDir1`).delete(true, undefined, true)
      await u(`${tstDir}/renameDir2`).delete(true, undefined, true)

      const newDirs = await tstDir.addDirectory(['renameDir1', 'L2'])
      const renamed = await expect(newDirs[0].rename('renameDir2')).to.be
        .fulfilled
      expect(`${renamed}`).to.equal(`${tstDir}/renameDir2`)
      expect(await renamed.exists).to.be.true
      expect(await u(`${tstDir}/renameDir1`).exists).to.be.false
    })
    it('renames a file', async () => {
      await u(`${tstDir}/renameFile1.txt`).delete(true, undefined, true)
      await u(`${tstDir}/renameFile2.txt`).delete(true, undefined, true)

      const file = await tstDir.addFile('renameFile1.txt')
      const renamed = await expect(file.rename('renameFile2.txt')).to.be
        .fulfilled
      expect(`${renamed}`).to.equal(`${tstDir}/renameFile2.txt`)
      expect(await renamed.exists).to.be.true
      expect(await u(`${tstDir}/renameFile1.txt`).exists).to.be.false
    })
    it('fail on invalid name file', async () => {
      await u(`${tstDir}/validFile.txt`).delete(true, undefined, true)

      const file = await tstDir.addFile('validFile.txt')
      await expect(file.rename('x/x')).to.be.rejectedWith(
        'rename: invalid name or path: \'validFile.txt\' to \'x/x\'',
      )
    })
    it('fails on overwrite existing file or folder', async () => {
      await u(`${tstDir}/fileToRenameC.txt`).delete(true, undefined, true)
      await u(`${tstDir}/renameFolderC`).delete(true, undefined, true)
      await u(`${tstDir}/fileToRenameD.txt`).delete(true, undefined, true)
      await u(`${tstDir}/renameFolderD`).delete(true, undefined, true)

      const file = await tstDir.addFile('fileToRenameC.txt')
      const folder = await tstDir.addDirectory('renameFolderC')
      await tstDir.addFile('fileToRenameD.txt')
      await tstDir.addDirectory('renameFolderD')
      await expect(file.rename('renameFolderD')).to.be.rejectedWith(
        'rename failed - name may already be in use: \'fileToRenameC.txt\' to \'renameFolderD\'',
      )
      await expect(file.rename('fileToRenameD.txt')).to.be.rejectedWith(
        'rename failed - name may already be in use: \'fileToRenameC.txt\' to \'fileToRenameD.txt\'',
      )
      await expect(folder.rename('fileToRenameD.txt')).to.be.rejectedWith(
        'rename failed - name may already be in use: \'renameFolderC\' to \'fileToRenameD.txt\'',
      )
      await expect(folder.rename('renameFolderD')).to.be.rejectedWith(
        'rename failed - name may already be in use: \'renameFolderC\' to \'renameFolderD\'',
      )
      expect(await file.exists).to.be.true
      expect(await folder.exists).to.be.true
    })
    it('fails gracefully when mv fails', async () => {
      const rootShell = new ShellHarness({
        user: 'root',
        rootPassword: process.env.RPASSWORD,
      })

      await u(`${tstDir}/fileToRenameX.txt`).delete(true, undefined, true)
      await u(`${tstDir}/rootOwnedFile.txt`, rootShell).delete(
        true,
        undefined,
        true,
      )

      const file = await tstDir.addFile('fileToRenameX.txt')

      const rootOwnedFile = await u(`${tstDir}`, rootShell).addFile(
        'rootOwnedFile.txt',
      )
      await expect(file.rename('rootOwnedFile.txt')).to.be.rejectedWith(
        'rename failed - name may already be in use: \'fileToRenameX.txt\' to \'rootOwnedFile.txt\'',
      )
      await rootOwnedFile.delete()
      rootShell.close()
    })
  })
  describe('trash', () => {
    it('can trash an item', async () => {
      const toTrash = await tstDir.addDirectory('ToTrash')
      await expect(toTrash.trash()).to.be.fulfilled
      expect(await u(`${tstDir}/ToTrash`).exists).to.be.false
    })
    it('fails to trash an item if permissions insufficient', async () => {
      const rootShell = new ShellHarness({
        user: 'root',
        rootPassword: process.env.RPASSWORD,
      })
      await u(`${tstDir}/rootFolder to trash`, rootShell).delete(
        true,
        undefined,
        true,
      )

      const toTrashRoot = await u(`${tstDir}`, rootShell).addDirectory(
        'rootFolder to trash',
      )
      await expect(u(`${tstDir}/rootFolder to trash`).trash()).to.be.rejected

      await expect(toTrashRoot.trash()).to.be.fulfilled

      rootShell.close()
    })
    it('can empty trash', async () => {
      await u(`${tstDir}/ToTrash`).delete(true, undefined, true)

      const toTrash = await tstDir.addDirectory('ToTrash')
      await toTrash.trash()
      expect(await toTrash.exists).to.be.false
      await expect(server.emptyTrash()).to.be.fulfilled
    })
  })
})

/* eslint-disable no-param-reassign */
/**
 * takes raw gio output, parses it, and updates `fsObj`
 * @param {string} gioOutput - raw string output from gio
 * @param {FsObject} fsObj - obj to imbue with gio information
 * @returns updated `fsObj`
 */
export default (gioOutput, fsObj) => {
  const obj = fsObj._props
  if (gioOutput.includes('GIOFAILED')) {
    obj.loadedGio = false
    obj.gioOutput = gioOutput
    return
  }

  const output = gioOutput.split('\n').slice(0, -1)
  const gioTmp = {}

  output.forEach(line => {
    const x = line.split(': ')
    // eslint-disable-next-line prefer-destructuring
    gioTmp[x[0].trim()] = x[1]
  })

  // gio.displayName = gioTmp['display name']
  // gio.name = gioTmp['name']
  // gio.editName = gioTmp['edit name']
  // gio.copyName = gioTmp['standard::copy-name']
  // gio.type = gioTmp.type
  // if (gioTmp['standard::is-symlink']) obj.isSymlink = true
  if (gioTmp['standard::symlink-target'])
    obj.symlinkTarget = gioTmp['standard::symlink-target']
  obj.contentType = gioTmp['standard::content-type']
  obj.fastContentType = gioTmp['standard::fast-content-type']
  // gio.size = parseInt( gioTmp['size'] )
  obj.uri = gioTmp.uri
  // gio.type = parseInt( gioTmp['standard::type'] )
  // gio.name = gioTmp['standard::name']
  // gio.displayName = gioTmp['standard::display-name']
  // gio.editName = gioTmp['standard::edit-name']
  obj.icon = gioTmp['standard::icon']
  // gio.size = parseInt( gioTmp['standard::size'] )
  // gio.allocatedSize = parseInt( gioTmp['standard::allocated-size'] )
  obj.symbolicIcon = gioTmp['standard::symbolic-icon']
  obj.etagValue = gioTmp['etag::value']
  obj.fileId = gioTmp['id::file']
  // gio.filesystem = parseInt( gioTmp['id::filesystem'] )
  fsObj._permissions.canRead = gioTmp['access::can-read'] === 'TRUE'
  fsObj._permissions.canWrite = gioTmp['access::can-write'] === 'TRUE'
  fsObj._permissions.canExecute = gioTmp['access::can-execute'] === 'TRUE'
  fsObj._permissions.canDelete = gioTmp['access::can-delete'] === 'TRUE'
  fsObj._permissions.canTrash = gioTmp['access::can-trash'] === 'TRUE'
  fsObj._permissions.canRename = gioTmp['access::can-rename'] === 'TRUE'
  // obj.dateModified2 = new Date(parseInt(gioTmp['time::modified']) * 1000)
  obj.timeOfLastModificationMicroSec = parseInt(
    gioTmp['time::modified-usec'],
    10
  )
  // gio.dateAccessed = new Date( parseInt( gioTmp['time::access'] ) * 1000 )
  obj.timeOfLastAccessMicroSec = parseInt(gioTmp['time::access-usec'], 10)
  // gio.dateChanged = new Date( parseInt( gioTmp['time::changed'] ) * 1000 )
  obj.timeOfLastMetaDataChangeMicroSec = parseInt(
    gioTmp['time::changed-usec'],
    10
  )
  // gio.device = parseInt( gioTmp['unix::device'] )
  // gio.inode = parseInt( gioTmp['unix::inode'] )
  obj.mode = parseInt(gioTmp['unix::mode'], 10)
  // gio.nlink = parseInt( gioTmp['unix::nlink'] )
  // gio.uid = parseInt( gioTmp['unix::uid'] )
  // gio.gid = parseInt( gioTmp['unix::gid'] )
  obj.rdev = parseInt(gioTmp['unix::rdev'], 10)
  // gio.blockSize = parseInt( gioTmp['unix::block-size'] )
  // gio.blocks = parseInt( gioTmp['unix::blocks'] )
  // gio.user = gioTmp['owner::user']
  fsObj._permissions.userReal = gioTmp['owner::user-real']
  // gio.group = gioTmp['owner::group']
  // gio._command = `gio info '${filename}'`
  obj.loadedGio = true
}

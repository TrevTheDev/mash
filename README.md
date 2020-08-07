# Introduction

Mash provides a simple interface to interact with the file system and shell commands. It is currently similar to Node's [fs Promises API](https://nodejs.org/api/fs.html#fs_fs_promises_api) but uses shell scripts. It spawns long running shell Child Processes and uses them for shell commands.

Ultimately this will become a complete JavaScript shell or ssh replacement. At the moment it is in early alpha and supports basic functionality.

# Contents

[TOC]

# Installation

```shell
npm install @TrevTheDev/Mash
```

## Prerequisites

- to copy and move files: `rsync` must be installed
- only tested on Ubuntu and Arch Linux, should work on many flavors of Linux - but not yet tested
- having `gio` installed is recommended

# Objectives/Goals

To:

- [x] provide a clean and consistent interface for the posix file system ( similar to node fs / shell.js )
- [x] use shell commands
- [x] run all shell commands in long-running Child Processes vs. a new process for each command
- [x] provide progress information on copy and move

Lofty goals:

- [ ] a fully functional cross platform html/JavaScript desktop replacement, possibly using Electron
- [ ] a https interface that can replace ssh and be more functionally rich (auto complete, suggestions - similar to the chrome debugger scratch pad)
- [ ] a clean and consistent posix systems administration and configuration interface
- [ ] a sufficiently broad interface so that most admins will not have to resort to shell commands
- [ ] simple and easily accessible recipes for commonly asked systems admin questions
- [ ] a clean and consistent interface into common software and features.
- [ ] the above for Windows, Mac OS, Android and iOS

We are far from achieving our lofty goals. If you are inspired, please contribute by:

- help code and write some pull requests;
- providing any useful feedback; and
- logging and identifying issues.

# Quick Overview

```javascript
u() // current working directory object
u(['./path/to/dir', '/another/path']) // return an array of locations
u('./path/to/fileName.txt').path.name // returns 'fileName'
```

All the following are asynchronous and return a promise. They must be preceded by `await` excluded for brevity:

```javascript
u('./path/to/dir').content // read directory content returns FsObjectArray
u('/path/to/dir').u('sub/dir') // returns FSObject '/path/to/dir/sub/dir'
u('./path/to/fileordir').parent // returns containing Directory
u('./path/to/fileordir').exists // confirms existence (returns boolean)

u('./path/to/dir').addDirectory('newDir') // creates a new dir object
u('./path/to/dir').addDirectory('newDir/nextDir') // creates two new dirs [array]
u('./path/to/dir').addDirectory(['a', 'b', 'c']) // creates three new dirs [array]

u('./path/to/dir').addFile('newFile.txt', 'content') // creates a new file with content.

u('./path/to/newSymlink').linkTo('/path/to/source') // creates symlink object
u('./path/to/symlink').linkTarget // returns symlink's Target FSObject
u('./path/to/symlink').linkEndTarget // symlink's ultimate target FSObject

u('./path/to/dirOrFile').touch() // touches object
u('./path/to/dir').rename('folderx') // renames to folderx
u('./path/to/source').copyTo('/path/to/dest') // copy to destination, with progress
u('./path/to/source').moveTo('/path/to/dest') // move to destination, with progress

u('./path/to/source').delete() // rm './path/to/source'
u('./path/to/source').trash() // moves to trash using gio
server.emptyTrash() // empties trash using gio

u('./path/to/source').stat() // stat, gio, lasattr and size of source

u('./path/to/source').type // returns posix fs type
u('./path/to/source').permissions // returns permissions e.g. 775
u('./path/to/source').permissions.symbol // returns permissions e.g. 'a+rwx'
u('./path/to/source').setPermissions('a+rwx') // chmod a+rwx
u('./path/to/source').user // returns user object
u('./path/to/source').setUser('bob') // sets user to bob
u('./path/to/source').group // returns group object
u('./path/to/source').setGroup('users') // sets group to 'users'

u('./path').cloneAttrs('./path/to/clone') // clones permissions, attributes,                                                           timestamps from fsObect to ./path
u('./path/to/dir').size // directory size object [size, file count etc.]

u('./path/to/file').read() // reads content of file
u('./path/to/file').write(content) // writes content to file
u('./path/to/file').append(content) // appends content to end of file

u('path/to/dir')
  .find.byName('myDoc')
  .byExt('txt')
  .biggerThan('100kB') // finds files

u('new/working/directory').cd() // set a new working directory

sh('some shell cmd;') // executes a shell command and returns result

server.users.currentUser // current user and group
server.pwd // gets current working directory
```

## Example Code

```javascript
import Server, {u, sh} from '@trevthedev/mash'

const server = new Server()

// think of u as being similar to a url bar except for the filesystem
const someDir = u('path/to/some/dir')

// if no path is supplied it defaults to the current working directory - pwd
const cwd = u()

console.log(`${cwd}`) // /path/to/current/working/directory

// creates a newFile in `some/dir` with content 'ABC'
const newFile = await u('some/dir').addFile('newFile.txt', 'ABC')

const statFile = await newFile.stat() // stat, gio, lsattr newFile
console.log(`${statFile.user}`) // someuser

const content = await newFile.read() // returns 'ABC'

const findIt = await u('some/dir')
  .find.byName('newFile')
  .byExt('txt')
  .smallerThan('100kB')
console.log(`${findIt[0]}`) // some/dir/newFile.txt

// copies NewFile
const copiedFile = await newFile.copyTo('/some/other/path')

// deletes newFile
await newFile.delete()

// moves copied file to trash
await u(`/some/other/path/${copiedFile.path.base}`).trash()

// JSON of directory's content
console.log(JSON.stringify(await u().content))

// run any shell command
const cmd = await sh('echo HELLO;')
console.log(cmd.output) // HELLO\n

Server.instance.close() // shuts down all active shell processes
```

For more examples please see our test scripts

# Specification

Exports:

- `Server` \<server\>
- `u` \<function\> see `Server.u`
- `sh` \<function\> see `Server.sh`

## Server

Instantiation:

```javascript
const server = new Server(config)
```

Calling u or sh will create a new Server instance using default [config](#config), if an instance doesn't already exist.

### config

`config` \<object\>

- `shell` \<object\> default shell configuration

  - shell config see configuration at https://github.com/TrevTheDev/shell-queue

- `log` \<boolean\> creates a log file. Default: true
- `logger` \<object\>
  - `console` \<object\>
    - `info` \<boolean\> log info messages to console. Default: false
    - `debug` \<boolean\> log debug messages to console. Default: false
    - `error` \<boolean\> log error messages to console. Default: false
  - `file` \<object\>
    - `info` \<string\> log info messages to provided path. Default: './logs/info.log'
    - `debug` \<string\> log debug messages to provided path. Default: './logs/debug.log'
    - `error` \<string\> log error messages to provided path. Default: './logs/error.log'

### server.u(paths, shell)

- `paths` \<array of strings\> | \<array of paths\> | \<string\> | \<path\> the path(s) to return
- `shell` \<shellHarness\> optional shell for all child commands
- returns \<fsObject\> | \<fsObjArray\>

### server.sh(command, doneCBPayload, doneCallback, sendToEveryShell)

shortcut to `server.shell.createCommand()`

- `command` \<string\> shell command to execute must terminate with a semi colon ;
- `doneCBPayload` \<anything\> optional payload to pass to doneCallback
- `doneCallback` \<function\> optional callback after command has executed, but before results returned. Whatever is returned from the doneCallback will be returned as the promise payload
- `sendToEveryShell` \<boolean\> sends command to every shell queue. Default: false
- returns \<commandIFace promise\> evaluates to results of shell command or `doneCallback` payload

### server.users

- returns: \<users\> see - `Users`

### server.config

- returns: \<object\> server [config](#config)

### server.emptyTrash()

- empties the trash using `gio trash`
- returns \<boolean\> true if no error occurred

### server.close()

- gracefully terminates any commands in the queue or shuts down any shell child processes

### server.shell

- returns \<shellHarness\> default shell - see [shell-harness](https://github.com/TrevTheDev/shell-harness) for further documentation

### server.executionContext

- returns \<executionContext\> default `executionContext` for commands

## FsObject

`const fsObject = u( paths, shell)` | `server.u( paths, shell)`

- `paths` \<array of strings\> | \<paths\> | \<string\> | \<path\> the path(s) to return
- `shell` \<shellHarness\> optional default shell for all child commands
- returns \<fsObject\>| \<fsObjArray\>

### fsObject.stat(gio, lsattr, size)

Returns a  `Directory`|`File`|`BlockDevice`|`CharacterDevice`|`LocalSocket`|`NamedPipe`|`Symlink` populated with the output of`stat`, `gio`, `lsattr` and `find`

- `gio` \<boolean\> include `gio` results. Default is `true`
- `lsattr` \<boolean\> include `lsattr` results. Default is `true`
- `size` \<boolean\> include comprehensive size results for directories. Default is `false`

`Directory`|`File`|`BlockDevice`|`CharacterDevice`|`LocalSocket`|`NamedPipe`|`Symlink` will have the following properties populated:

- `permissions` \<object\>
  - `accessRights` \<string\> octal string of permissions
  - `octal` \<sting\> octal string of permissions
  - `symbol` \<string\> sting of permissions
  - `boolArray` \<array\> boolean array of permissions
  - `user` \<user\>
  - `group` \<group\>
- `accessRights` \<string\> octal string of permissions
- `group` \<group\>
- `user` \<user\>
- `paths` \<pathContainer\> see PathContainer
- `blocksAllocated` \<integer\>
- `deviceNumber` \<integer\>
- `type` \<FILE_TYPE_ENUMS\>
  - `file`
  - `directory`
  - `symbolic link`
  - `character device`
  - `block device`
  - `local socket`
  - `named pipe`
- `numberHardLinks` \<integer\>
- `inode` \<integer\>
- `majorDeviceType` \<integer\>
- `minorDeviceType` \<integer\>
- `timeOfBirth` \<date\>
- `timeOfLastAccess` \<date\>
- `timeOfLastModification` \<date\>
- `timeOfLastStatusChange` \<date\>
- `contentType` \<string\>
- `fastContentType` \<string\>
- `uri` \<string\>
- `icon` \<string\>
- `symbolicIcon` \<string\>
- `etagValue` \<string\>
- `fileId` \<string\>
- `canRead` \<boolean\>
- `canWrite` \<boolean\>
- `canExecute` \<boolean\>
- `canDelete` \<boolean\>
- `canTrash` \<boolean\>
- `canRename` \<boolean\>
- `timeOfLastModificationMicroSec` \<integer\>
- `timeOfLastAccessMicroSec` \<integer\>
- `timeOfLastChangedMicroSec` \<integer\>
- `mode` \<integer\>
- `rdev` \<integer\>
- `userReal` \<string\>
- `lsattrArr` \<array\>
- `size` \<size\> | \<directorySize\>
  - `DirectorySize`
    - `size` \<size\>
    - `diskUsage` \<size\>
    - `directoryCount` \<integer\>
    - `fileCount` \<integer\>
- `loadedGio` \<boolean\> true if `fsObject` `gio`'ed
- `loadedStat` \<boolean\> true if `fsObject` `stat`'ed
- `loadedLsattr` \<boolean\> true if `fsObject` `lsattr`'ed
- `loadedContent` \<boolean\> true if Directory content loaded
- `loadedSize` \<boolean\> true if Directory size queried
- `lsattr` booleans
  - `appendOnly`
  - `compressed`
  - `noDump`
  - `extentFormat`
  - `immutable`
  - `dataJournaling`
  - `secureDeletion`
  - `noTailMerging`
  - `unDeletable`
  - `noAtimeUpdates`
  - `synchronousDirectoryUpdates`
  - `synchronousUpdates`
  - `topOfDirectoryHierarchy`
  - `hugeFile`
  - `compressionError`
  - `indexedDirectory`
  - `compressionRawAccess`
  - `compressedDirtyFile`

### fsObject.copyTo(destinationDirectory, copyType, confirmOverwriteCallBack)

Uses `rsync` to copy files and directories

- `destinationDirectory` \<fsObject\> | \<path\> | \<string\> destination of directory of copy
- `copyType` \<CP_TYPE\>:
  - `'overwrite'`
  - `'overwriteOlder'`
  - `'askBeforeOverwrite'`
  - `'doNotOverwrite'`
- `confirmOverwriteCallBack` \<function\> callback that must return a \<string\> one of:
  - `'yes'` - overwrite individual file or directory
  - `'no'` - don't overwrite individual file or directory
  - `'all'` - overwrite all files or directories
  - `'none'` - don't overwrite any files or directories
  - `'cancel'` - cancel copyTo
- returns \<progressTracker→fsObject > promise that will ultimately evaluate to destination `fsObject`

### ProgressTracker

Tracks `copyTo` or `moveTo` progress.

- Events:
  - `progressUpdate`
- members
  - `targetBytes` \<size\>
  - `bytesCompleted` \<size\>
  - `bytesRemaining` \<size\>
  - `progressFileCount` \<integer\>
  - `targetFileCount` \<integer\>
  - `progressFileCount` \<integer\>
  - `targetDirectoryCount` \<integer\>
  - `progressDirectoryCount` \<integer\>
  - `percentageCompleted` \<percentage\>
  - `deltaRateOfCompletion` \<rate\>
  - `rateOfCompletion` \<rate\>
  - `deltaETC` \<date-fns distance\>
  - `ETC` \<date-fns distance\>
  - `sourceFSObject` \<fsObject\>
  - `destinationDirectory` \<fsObject\>
  - `currentSourcePath` \<path\>
  - `currentDestinationDirectoryPath` \<path\>
  - `startedAt` \<date-fns formatted date\>
  - `cancel()` - cancels copy
- Returns \<promise→fsObject\> promise that will ultimately evaluate to destination `fsObject` object

Example

```javascript
const copyCmd = u('directoryOrFileToCopy').copyTo('copy/to/here')
copyCmd.on('progressUpdate', progressTracker => {
  console.log(`bytesCompleted: ${progressTracker.bytesCompleted}`)
  console.log(`bytesRemaining: ${progressTracker.bytesRemaining}`)
  console.log(`progressFileCount: ${progressTracker.progressFileCount}`)
  console.log(
    `progressDirectoryCount: ${progressTracker.progressDirectoryCount}`
  )
  console.log(`percentageCompleted: ${progressTracker.percentageCompleted}`)
  console.log(`rateOfCompletion: ${progressTracker.rateOfCompletion}`)
  console.log(`ETC: ${progressTracker.ETC}`)
    
  progressTracker.cancel() // cancels copyTo
})
await copyCmd
```

### fsObject.moveTo(destinationDirectory, copyType, confirmOverwriteCallBack)

Uses `rsync` to move files and directories. Same as copyTo, except source files and directories are deleted after move.

### fsObject.rename(newName)

Uses `mv` to rename files or directories

- `newName` \<path\> | \<string\> new name
- returns \<promise→fsObject\> renamed file or directory

### fsObject.cloneAttrs(sourceFsObject)

- `sourceFsObject` \<fsObject\> source file system object whose attributes should be copied
- returns \<fsObject\> matches owner (`chown`), permissions (`chmod`), attributes (`chattr`) and timestamps (`touch`)

### fsObject.addDirectory(nameArr, ignoreAnyExistingDirectories)

Uses `mkdir` to create new directories

- `nameArr` \<path\> | \<string\> | \<array of paths\> | \<array of string\> new directory name(s)
- `ignoreAnyExistingDirectories` \<boolean\> whether to overwrite existing directories or files - default is `false`
- returns \<promise→Directory|Array of Directories\> newly created directories
  - `nameArr` of ['A1','A2','A3] will result in a directories as follows: path+/A1/A2/A3
    - `nameArr` of ['A1'],['A2'],['A3'] will result in a directories of path+/A1, path+/A2, path+/A3
    - `nameArr` of [['A1','B1','B2'],['A2'],['A3'] will result in path+/A1/B1/B2, path+/A2, path+/A3

### fsObject.addFile(name, content, overwrite)

Creates a new file

- `name` \<path\> | \<string\> new file name
- `content` \<string\> content to write to file
- `overwrite` \<boolean\> whether to overwrite existing directories or files - default is `false`
- returns \<promise→file\> newly created file

### fsObject.find

See [FindBuilder](#FindBuilder) below

### fsObject.linkTo(destination, overwrite)

Creates a symbolic link `fsObject` to destination using `ln`.

- `destination` \<path\> | \<string\> destination to be symlinked to
- `overwrite` \<boolean\> remove any existing file or directory. Default: false
- returns \<promise→symlink\> newly created symlink

### fsObject.linkTarget

- returns \<promise→fsObject\> the target of a symlink

### fsObject.linkEndTarget

- returns \<promise→fsObject\>` the ultimate target of a symlink or chain of symlinks

### fsObject.touch()

- returns \<promise→fsObject\> `touch's` fsObject

### fsObject.delete(recursive, limitToThisDirsFileSystem, onlyIfExists)

deletes `fsObject` from file system using `rm`

- `recursive` \<boolean\> delete recursively if directory. Default: `false`
- `limitToThisDirsFileSystem` \<boolean\> when removing a hierarchy recursively, skip any directory that is on a file system different from that of the corresponding `destination` argument . Default: `false`
- `onlyIfExists` \<boolean\> only deletes the file system object if it already exists, else returns false. Default: `false`
- returns \<promise→boolean\> true

### fsObject.trash()

`gio trash` `fsObject`

- returns \<boolean\> `true` if successful

### fsObject.setPermissions(permissions, applyRecursively)

sets `fsObject` file system permissions using `chmod`

- `permissions` \<string\> any permission string accepted by chmod
- `applyRecursively` \<boolean\> if directory apply permissions recursively. Default: `false`
- returns \<promise→fsObject\> changed file system permissions

### fsObject.content

returns a \<fsObjectArray\> populated with a directories contents if it is already loaded, otherwise returns a promise that loads it first

- returns \<promise | fsObjectArray\> directory's contents | \<Promise\> resolves to directory's contents

### fsObject.dir(gio, lsattr, size, recursively)

returns a \<fsObjectArray\> populated with a directories contents if it is already loaded, otherwise returns a promise that loads it first

- `gio` \<boolean\> gio each item in directory's contents. Default: `true`
- `lsattr` \<boolean\> lsattr each item in directory's contents. Default: `true`
- `size` \<boolean\> query each directory's size. Default: `false`
- `applyRecursively` \<boolean\> recursively populate all child directories. Default: `false`
- returns \<promise→fsObjectArray\> resolves to directory's contents

### fsObject.setUser(user, group, applyRecursively)

changes user and/or group using `chown`

- `user` \<string\> | \<user\> new user
- `group` \<string\> | \<group\> new group
- `applyRecursively` \<boolean\> if directory changes user or group recursively. Default: `false`
- returns \<promise→fsObject\> changed file system permissions

### fsObject.setGroup(group, applyRecursively)

changes group using `chgrp`

- `group` \<string\> | \<group\> new group
- `applyRecursively` \<boolean\> if directory changes group recursively. Default: `false`
- returns \<promise→fsObject\> changed file system permissions

### fsObject.read()

- returns \<promise→string\> of file contents using `cat`

### fsObject.readStream(options)

- `options` \<object\> see [here](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)

- returns \<readStream\> of file contents

### fsObject.write(content, overwrite)

writes content to a file

- `content` \<string\> string to write to file
- `overwrite` \<boolean\> overwrite the file if it already exists. Default: `false`
- returns \<promise→fsObject\> new or overwritten file

Requires both the user who launched mash, and the shell user to have access to `os.tmpdir()`

### fsObject.writeStream(readStream, overwrite)

Writes readable Stream to a file

- `readableStream` \<readableStream\> stream to write to file
- `overwrite` \<boolean\> overwrite the file if it already exists. Default: `false`
- returns \<promise→fsObject\> new or overwritten file

Uses Node's File System module to write the file.

### fsObject.append(content, encoding, mode)

Append data to a file, creating the file if it does not exist. Note this is not yet using the shell, but rather node's `fsPromises`

- `content` \<string\> string to write to file
- `encoding` \<string\> content encoding. Default: `utf8`
- `mode` \<string\> if not supplied, the default of `0o666` is used.
- returns \<promise→fsObject\> appended file

### fsObject.readChunk(startPosition, numberOfBytes, encoding)

Reads from `startPosition` for `numberOfBytes` and returns it as a \<string\>. Note this is not yet using the shell, but rather node's `read`

- `startPosition` \<integer\> position in bytes to start reading from
- `numberOfBytes` \<integer\> number of bytes to read
- `encoding` \<string\> if not supplied, the default of `utf8` is used
- returns \<string\> contents of file

### fsObject.writeChunk(chunk, startPosition, encoding)

Writes `chunk` from `startPosition` and returns \<boolean\> if successful. Note this is not yet using the shell, but rather node's `write`

- `chunk` \<string\> content to write to file
- `startPosition` \<integer\> position in bytes to start writing from
- `encoding` \<string\> if not supplied, the default of `utf8` is used
- returns \<boolean\> true if successful

### fsObject.exists

- returns \<boolean\> `true` if path exists and is accessible on file system uses `realpath`

### fsObject.parent

- returns \<fsObject\> object that is the containing parent or undefined if already root

### fsObject.u(path)

- path \<path\> | \<string\> relative child path
- returns \<fsObject\> if `fsObject` path is `/home` `fsObject.u('user/path')` will reference `/home/user/path`

### fsObject.executionContext

- returns \<executionContext\> `executionContext` used by `fsObject`

### fsObject.sh(command, doneCBPayload, doneCallback, sendToEveryShell)

provides access to the fsObject's referenced shell instance.

- `command` \<string\> shell command to execute must terminate with a semi colon ;
- `doneCBPayload` \<anything\> optional payload to pass to doneCallback
- `doneCallback` \<function\> optional callback after command has executed, but before results returned. Whatever is returned from the `doneCallback` will be returned as the promise payload
- `sendToEveryShell` \<anything\> sends same command to every `ShellQueue`
- returns \<commandIFace\> promise that evaluates to results of the shell command or return from `doneCallback`

### fsObject.paths

- returns \<pathContainer\> see [PathContainer](#PathContainer)

### fsObject.path

- returns \<path\> see [Path](#Path)

### fsObject.toString()

- returns \<string\> path string

### fsObject.toJSON()

- returns \<JSON\> path string if not loaded, otherwise JSON of all properties

## Directory

extents `FsObject`

excludes: `linkTo`, `linkTarget`, `linkEndTarget`,`read`, `write`, `append`, `readChunk`, `writeChunk`, `writeStream`

modifies

### Directory.toJSON(pathOnly, expandContent)

- `pathOnly` \<boolean\> if true returns only the path string. Default: false
- `expandContent` \<boolean\> if true includes a directories contents in the returned JSON. It doesn't `stat` the content, only includes it if it has previously been `stat`'ed. It recursively includes sub directories. Default: true
- returns \<object\> json of Directory

## File

extents `FsObject`

excludes: `linkTo`, `linkTarget`, `linkEndTarget`, `addDirectory`, `addFile`, `dir`, `cd`, `content`, `find`

modifies:

- `delete(onlyIfExists = false)`
- `setPermissions(permissions)`
- `setUser(user, group)`
- `setGroup(group)`

## Symlink

extents `FsObject`

## BlockDevice & CharacterDevice & LocalSocket & NamedPipe

extents `FsObject`

excludes: `linkTo`, `linkTarget`, `linkEndTarget`, `addDirectory`, `addFile`, `dir`, `cd`, `content`, `find`

modifies:

- `delete(onlyIfExists = false)`
- `setPermissions(permissions)`
- `setUser(user, group)`
- `setGroup(group)`

## FsObjectArray

### fsObjectArray.directories

- returns \<array\> all the directories in the array

### fsObjectArray.files

- returns \<array\> all the files in the array

## PathContainer

- `requestedPath`
  - returns \<path\> path originally requested
- `canonisedPath`
  - returns \<path\> path returned via `realpath`
- `canonised`
  - returns \<boolean\> if path has been canonised via the shell
- `statPath`
  - returns \<path\> path returned after `await fsObject.stat()`
- `symlinkTargetPath`
  - returns \<path\> symlink target if symlink via `readlink`
- `path`
  - returns \<path\> `statPath` || `canonisedPath` || `requestedPath`
- `canoniseRequestPath`()
  - returns `<promise→path>` path canonise'ed by `realpath`
- `getSymlinkTargetPath()`
  - returns \<promise→path\> symlink target path
- `exists`()
  - returns \<promise→boolean\> path exists on disk

## Path

- `root` \<path\> root of path
- `isRoot` \<boolean\> true if path is root
- `ext` \<string\> the file's extension
- `name` \<path\> the name excluding any `ext`
- `base` \<path\> the name including any `ext`
- `pathString` \<string\> the path as a string
- `isAbsolute` \<boolean\> true if path is absolute, false if relative
- `parentPath` \<path\> path of the containing parent
- `addSegment`(segment)
  - segment \<string\> | \<path\> segment to add to path
- `toArray` \<array\> path as an array
- `toString` \<string\> path as a string
- `toJSON` \<json\> path as json

## FindBuilder

Builds the options for the `find` command. It provides the following helper functions:

- `byName(name)`
- `byRegEx(regex)` note regex is prefixed with \`.\*/\`
- `ignoreCase()` makes `byName` and `byRegEx` case insensitive
- `byInode(inodeNumber)`
- `byExt(ext)` - appends .ext | \*.ext to name
- `byType(type)` - type is `FILE_TYPE_ENUMS`
- `isDirectory()` - directories only
- `isFile()` - files only
- `isSymlink()` - simlinks only
- `biggerThan(size)` size is `integer` of bytes | `size` object | `string` representing size
- `smallerThan(size)` size is `integer` of bytes | `size` object | `string` representing size
- `isEmpty()` - only empty files or directories
- `modifiedWithin(minutes)` minutes is`integer`
- `modifiedAtLeast(minutes)` minutes is`integer`
- `accessedWithin(minutes)` minutes is`integer`
- `accessedAtLeast(minutes)` minutes is`integer`
- `metaDataModifiedWithin(minutes)` minutes is`integer`
- `metaDataModifiedAtLeast(minutes)` minutes is`integer`
- `byGroup(group)` group is `string` | `group`
- `byGID(gid)` gid is`integer`
- `hasNoGroup()`
- `byUser(user)` user is `string` | `user`
- `byUID(uid)` uid is`integer`
- `hasNoUser()`
- `ignoreSubdirectories()`
- `isExecutable()` - by current user
- `isReadable()` - by current user
- `isWritable()` - by current user

Later options may overwrite options that proceed them.

Alternatively options can be set directly via `findBuilder.options(options)` options object includes:

- `maxDepthToSearch`: Default: `undefined`,
- `name`: Default: `undefined`,
- `regex`: Default: `undefined`,
- `caseInsensitive`: Default: `false`
- `inodeNumber`: Default: `undefined`,
- `ext`: Default: `undefined`,
- `type`: Default: `undefined`,
- `biggerThan`: Default: `undefined`,
- `smallerThan`: Default: `undefined`,
- `onlyIfEmptyFileOrDir`: Default: `false`,
- `contentLastModifiedMinutesAgo`: Default: `undefined`,
- `lastAccessedMinutesAgo`: Default: `undefined`,
- `metaDataLastModifiedMinutesAgo`: Default: `undefined`,
- `group`: Default: `undefined`,
- `gid`: Default: `undefined`,
- `hasNoGroup`: Default: `false`,
- `user`: Default: `undefined`,
- `uid`: Default: `undefined`,
- `hasNoUser`: Default: `false`,
- `atLeastMatchPermissions`: Default: `undefined`,
- `isExecutable`: Default: `false`,
- `isReadable`: Default: `false`,
- `isWritable`: Default: `false`

`FindBuilder` is a promise that evaluates to an `fsObjectArray` of the results of the find command.

### Example Code

```javascript
import {u} from '@trevthedev/mash'
//the following find options make no sense but is shown for illustration purposes
const findResult = await u('some/path')
  .find.byName('someName')
  .byExt('.txt')
  .byRegEx('some.reg.ex')
  .ignoreCase()
  .byInode(123)
  .byType(FILE_TYPE_ENUMS.file)
  .isDirectory()
  .isFile()
  .isSymlink()
  .biggerThan('1B')
  .smallerThan('200kB')
  .isEmpty()
  .modifiedWithin(60)
  .modifiedAtLeast(60)
  .accessedWithin(60)
  .accessedAtLeast(60)
  .metaDataModifiedWithin(60)
  .metaDataModifiedAtLeast(60)
  .byGroup('users')
  .byGID(1001)
  .hasNoGroup()
  .byUser('user')
  .byUID(1001)
  .hasNoUser()
  .ignoreSubdirectories()
  .isExecutable()
  .isReadable()
  .isWritable()

// alternatively:
const findResult2 = await u('some/path').find.options({
  atLeastMatchPermissions: undefined,
  biggerThan: 1,
  caseInsensitive: true,
  contentLastModifiedMinutesAgo: '+60',
  ext: '.txt',
  gid: 1001,
  group: 'users',
  hasNoGroup: false,
  hasNoUser: true,
  inodeNumber: 123,
  isExecutable: true,
  isReadable: true,
  isWritable: true,
  lastAccessedMinutesAgo: '+60',
  maxDepthToSearch: 1,
  metaDataLastModifiedMinutesAgo: '+60',
  name: 'someName',
  onlyIfEmptyFileOrDir: true,
  regex: 'some.reg.ex',
  smallerThan: 200000,
  type: FILE_TYPE_ENUMS.symbolicLink,
  uid: 1001,
  user: 'user'
})
```

## Users

accessed via `server.users`

- `getUser`(`uidOrName`)
  - `uidOrName` \<string\> optional uid or name to look up using id, if none is supplied the user logged into the shell is returned
  - returns `<promise→user>` returns user of uid or name
- `currentUser` `<promise→user>` returns the shells current user using `id`
- `currentGroup` `<promise→group>` returns the shells current group
- `knownUsers` \<array\> array of know users previously returned via id
- `knownGroups` \<array\> array of know groups previously returned via id

## User

- `name` \<string\> user name
- `uid` \<integer\> uid
- `groups` \<array\> array of groups user belongs to
- `effectiveGroup` \<group\> user's effective group
- `type` \<string\> 'user'
- `users` \<users\> reference to users which links to the server and required shell

## Group

- `name` \<string\> group name
- `gid` \<integer\> gid
- `type` \<string\> 'group'
- `users` \<users\> reference to users which links to the server and required shell

## Advanced Shell Interaction Examples

##### Interact with shell

```javascript
const cmd = server.shell.interact('echo "what is your name?" ; read name;\n')
cmd.on('data', stdout => {
  if (stdout === 'what is your name?\n') {
    cmd.stdin.write('Bob\necho $name\n ')
    cmd.sendDoneMarker() // required to indicate that this interaction is completed
  } else console.log(stdout) // `Bob\n`
})
const res = await cmd
console.log(res.output) // `what is your name?\nBob\n`
```

##### Get a root or other user shell

```javascript
import {ShellHarness} from '@trevthedev/mash'

const rootShell = new ShellHarness({
  user: 'root', // or other user
  rootPassword: 'whatEver'
})
const res = await rootShell.createCommand('whoami;')
console.log(res.output) // 'root\n'

//or

const rootServer = new Server({
  shell: {
    user: 'root', // or other user
    rootPassword: 'whatEver'
  }
})
// now all commands will use rootServer - note only one server can run at a time
const whoami = sh('whoami;')
rootServer.close()
```

Root is gained using `sudo -S su` and assumes `sudo` requires a password. As a hack, sending of password is delayed by `config.shell.sudoWait` default is 50. If root is not be acquired increase this.

##### Intercept and replace output

The output from a command can be intercepted in two ways and different result substituted if required.

```javascript
import Server, {sh} from '@trevthedev/mash'
const cb = (cmd, cbData) => {
  console.log(cbData) // 'HIT'
  return true
}
console.log(await sh('printf HELLO ;', 'HIT', cb)) // true
await Server.instance.close() // clean up
```

or

```javascript
const callBackServer = new Server({
  shell: {
    doneCallback: cb
  }
})
// now all commands will use doneCallback - note only one server can run at a time
console.log(await sh('printf HELLO ;', 'HIT')) // true
await Server.instance.close()
```

##### Receive data via IPC

```javascript
const cmd = server.shell.interact(
  'printf "{\\"ipc\\": \\"true\\"}\\n" 1>&$NODE_CHANNEL_FD ; printf HELLO ; \n'
)
cmd.on('message', data => {
  console.log(data) // { ipc: "true" }
  cmd.sendDoneMarker() // required to finalise cmd
})
const res = await cmd
console.log(res.output) // `HELLO`
```

##### Send data via IPC

```javascript
const cmd = server.shell.interact('echo ; \n')
cmd.on('data', stdout => {
  if (stdout === '\n') {
    cmd.sendMessage('HELLOBOB')
    cmd.stdin.write('read -r line <&3 ; printf $line ; \n')
    cmd.sendDoneMarker() // required to finalise cmd
  }
})
const res = await cmd
console.log(res.output) // \n"HELLOBOB"`
```

Node formats messages sent via IPC
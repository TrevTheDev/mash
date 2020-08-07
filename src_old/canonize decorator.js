export const canonizeDecorator = (wrapped) => async (fsObject, ...args) => {
  await fsObject.paths.canonizeRequestPath()
  return wrapped(fsObject, ...args)
}

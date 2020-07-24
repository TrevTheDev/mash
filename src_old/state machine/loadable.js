export default {
  allowedEnterStates: ['init'],
  enter(target) {
    glob.fsObjectsByType.changeFsObjectToType(target)
  },
  exit(target) {

  },
}

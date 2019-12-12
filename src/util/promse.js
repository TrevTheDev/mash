// class Resolver {
//   constructor(promise) {
//     this._callbacks = []
//     this._errbacks = []
//     this.promise = promise
//     this._status = 'pending'
//     this._result = null
//   }

//   fulfill(value) {
//     if (this._status === 'pending') {
//       this._result = value
//       this._status = 'fulfilled'
//     }

//     if (this._status === 'fulfilled') {
//       Resolver._notify(this._callbacks, this._result)
//       this._callbacks = []
//       this._errbacks = null
//     }
//   }

//   reject(reason) {
//     if (this._status === 'pending') {
//       this._result = reason
//       this._status = 'rejected'
//     }

//     if (this._status === 'rejected') {
//       if (!this._errbacks.length)
//         console.log(
//           'This promise was rejected but no error handlers were registered to it',
//           'info'
//         )

//       Resolver._notify(this._errbacks, this._result)
//       this._callbacks = null
//       this._errbacks = []
//     }
//   }

//   resolve(value) {
//     if (SimplePromise.isPromise(value)) {
//       value.then(
//         value => this.resolve(value),
//         reason => this.reject(reason)
//       )
//     } else this.fulfill(value)
//   }

//   then(callback, errback) {
//     return this.promise.then(callback, errback)
//   }

//   _addCallbacks(callback, errback) {
//     const callbackList = this._callbacks
//     const errbackList = this._errbacks
//     const status = this._status
//     const result = this._result

//     if (callbackList && typeof callback === 'function')
//       callbackList.push(callback)
//     if (errbackList && typeof errback === 'function') errbackList.push(errback)

//     if (status === 'fulfilled') this.fulfill(result)
//     else if (status === 'rejected') this.reject(result)
//   }

//   static _notify(subs, result) {
//     if (subs.length) {
//       process.nextTick(() => {
//         const len = subs.length
//         for (let i = 0; i < len; i += 1) {
//           subs[i](result)
//         }
//       })
//     }
//   }
// }
// export default class SimplePromise {
//   constructor(fn) {
//     const resolver = new Resolver(this)
//     this._resolver = resolver

//     try {
//       fn.call(
//         this,
//         value => resolver.resolve(value),
//         reason => resolver.reject(reason)
//       )
//     } catch (e) {
//       resolver.reject(e)
//     }
//   }

//   then(callback, errback) {
//     const Constructor = this.constructor
//     const resolver = this._resolver
//     return new Constructor((resolve, reject) => {
//       resolver._addCallbacks(
//         typeof callback === 'function'
//           ? SimplePromise._wrap(resolve, reject, callback)
//           : resolve,
//         typeof errback === 'function'
//           ? SimplePromise._wrap(resolve, reject, errback)
//           : reject
//       )
//     })
//   }

//   catch(errback) {
//     return this.then(undefined, errback)
//   }

//   static _wrap(resolve, reject, fn) {
//     return valueOrReason => {
//       try {
//         const result = fn(valueOrReason)
//         resolve(result)
//       } catch (e) {
//         reject(e)
//       }
//     }
//   }

//   static isPromise(obj) {
//     let then
//     // We test Promses by structure to be able to identify other
//     // implementations' Promses. This is important for cross compatibility and
//     // In particular Y.when which should recognize any kind of Promse
//     // Use try...catch when retrieving obj.then. Return false if it throws
//     // See Promses/A+ 1.1
//     try {
//       ;({then} = obj)
//     } catch (_) {}
//     return typeof then === 'function'
//   }

//   resolve(value) {
//     return SimplePromise.isPromise(value) && value.constructor === this
//       ? value
//       : new this(resolve => {
//           resolve(value)
//         })
//   }

//   reject(reason) {
//     return new this((resolve, reject) => reject(reason))
//   }

//   static all(values) {
//     return new SimplePromise((resolve, reject) => {
//       if (!Array.isArray(values)) {
//         reject(
//           new TypeError('Promse.all expects an array of values or Promses')
//         )
//         return
//       }

//       let remaining = values.length
//       let i = 0
//       const {length} = values
//       const results = []

//       const oneDone = index => {
//         return value => {
//           results[index] = value
//           remaining -= 1
//           if (!remaining) resolve(results)
//         }
//       }

//       if (length < 1) {
//         return resolve(results)
//       }

//       for (; i < length; i += 1) {
//         SimplePromise.resolve(values[i]).then(oneDone(i), reject)
//       }
//     })
//   }

//   static race(values) {
//     return new SimplePromise((resolve, reject) => {
//       if (!Array.isArray(values)) {
//         reject(
//           new TypeError('Promse.race expects an array of values or Promses')
//         )
//         return
//       }
//       for (let i = 0, count = values.length; i < count; i += 1) {
//         SimplePromise.resolve(values[i]).then(resolve, reject)
//       }
//     })
//   }
// }

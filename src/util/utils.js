// import deasync from 'deasync'
// import SimplePromise from './promse'

// eslint-disable-next-line import/prefer-default-export
export const isNumber = value =>
  // eslint-disable-next-line no-self-compare
  typeof value === 'number' && value === value && Number.isFinite(value)

// export class ChainablePromise extends SimplePromise {
//   constructor(executor) {
//     super(executor)
//     return new Proxy(this, {
//       get(target, prop) {
//         if (prop in target) return target[prop]
//         if (SimplePromise.isPromise(target)) {
//           // let obj
//           // target.then(done => {
//           //   obj = done
//           // })
//           // deasync.loopWhile(() => obj === undefined)
//           // return obj[prop]
//           return (...fnArgs) =>
//             new ChainablePromise(results => {
//               ;(async () => {
//                 const obj = await target
//                 if (typeof obj[prop] === 'function')
//                   results(obj[prop](...fnArgs))
//                 else results(obj[prop])
//               })()
//             })
//         }
//         return target[prop]
//       }
//     })
//   }
// }

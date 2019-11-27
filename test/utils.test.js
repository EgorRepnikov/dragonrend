const { reduce, wrapMiddleware } = require('../lib/utils')
const { isSentS, sendS } = require('../lib/symbols')

describe('Utils', () => {
  describe('reduce function', () => {
    it('reduce 3 functions', async () => {
      let counter = 0
      const fns = reduce([
        () => counter++,
        () => counter++,
        () => counter++
      ], {
        response: {
          [isSentS]: false,
          status() {},
          header() {},
          [sendS]() {}
        }
      })
      await fns
      expect(counter).toEqual(3)
    })
    it('stop on ctx.res.isSent', async () => {
      let counter = 0
      const fns = reduce([
        () => counter++,
        ctx => {
          counter++
          ctx.response[isSentS] = true
        },
        () => counter++,
      ], {
        response: { [isSentS]: false }
      })
      await fns
      expect(counter).toEqual(2)
    })
    it('catch error in promises chain', async () => {
      let counter = 0
      const fns = reduce([
        () => { throw new Error('Error') },
        () => counter++
      ], {
        response: { [isSentS]: false }
      })
      try {
        await fns
      } catch (e) {
        expect(e.message).toEqual('Error')
      }
      expect(counter).toEqual(0)
    })
  })
  describe('wrapMiddleware function', () => {
    it('wrap mock middleware and execute', async () => {
      let isSent = false
      const ctx = {
        response: {
          status(status) {},
          header(header) {},
          [sendS](body) {
            isSent = true
          }
        }
      }
      const middleware = () => ({})
      await wrapMiddleware(middleware)(ctx)
      expect(isSent).toBe(true)
    })
  })
})

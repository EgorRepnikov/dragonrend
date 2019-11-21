const { reduce } = require('../lib/utils')
const { isSentS } = require('../lib/symbols')

describe('Utils', () => {
  describe('reduce function', () => {
    it('reduce 3 functions', async () => {
      let counter = 0
      const fns = reduce([
        () => counter++,
        () => counter++,
        () => counter++
      ], {
        response: { [isSentS]: false }
      })
      await fns
      expect(counter).toEqual(3)
    })
    it('stop on ctx.res.isSent', async () => {
      let counter = 0
      const fns = reduce([
        () => counter++,
        (ctx) => {
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
})

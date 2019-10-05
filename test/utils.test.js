const { reduce } = require('../lib/utils')

describe('Utils', () => {
  describe('reduce function', () => {
    it('reduce 3 functions', async () => {
      let counter = 0
      const fns = reduce([
        () => counter++,
        () => counter++,
        () => counter++
      ], {
        response: { isSent: false }
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
          ctx.response.isSent = true
        },
        () => counter++,
      ], {
        response: { isSent: false }
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
        response: { isSent: false }
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

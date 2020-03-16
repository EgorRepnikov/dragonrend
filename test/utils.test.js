const { reduce } = require('../lib/utils')

describe('Utils', () => {
  describe('reduce function', () => {
    it('reduce 3 functions', async () => {
      let counter = 0
      const fns = reduce([
        () => counter++,
        () => counter++,
        () => counter++
      ], {})
      await fns
      expect(counter).toEqual(3)
    })
    it('stop on second fn', async () => {
      let counter = 0
      const fns = reduce([
        () => counter++,
        () => {
          counter++
          return false
        },
        () => counter++,
      ], {})
      await fns
      expect(counter).toEqual(2)
    })
    it('catch error in promises chain', async () => {
      let counter = 0
      const fns = reduce([
        () => { throw new Error('Error') },
        () => counter++
      ], {})
      try {
        await fns
      } catch (e) {
        expect(e.message).toEqual('Error')
      }
      expect(counter).toEqual(0)
    })
  })
})

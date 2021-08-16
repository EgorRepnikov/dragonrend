const { compose } = require('../lib/utils')

describe('Utils', () => {
  describe('compose function', () => {
    it('compose 3 functions', async () => {
      let counter = 0
      const fns = compose([
        (_, next) => {
          counter++
          return next()
        },
        (_, next) => {
          counter++
          return next()
        },
        () => counter++
      ], {})
      await fns()
      expect(counter).toEqual(3)
    })
    it('stop on second fn', async () => {
      let counter = 0
      const fns = compose([
        (_, next) => {
          counter++
          next()
        },
        () => counter++,
        () => counter++,
      ], {})
      await fns()
      expect(counter).toEqual(2)
    })
    it('catch error in promises chain', async () => {
      let counter = 0
      const fns = compose([
        () => { throw new Error('Error') },
        () => counter++
      ], {})
      try {
        await fns()
      } catch (e) {
        expect(e.message).toEqual('Error')
      }
      expect(counter).toEqual(0)
    })
  })
})

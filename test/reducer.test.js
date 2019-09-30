const reducer = require('../lib/reducer')

describe('reducer function', () => {
  it('reduce 3 functions', async () => {
    let counter = 0
    const fns = reducer([
      () => counter++,
      () => counter++,
      () => counter++
    ], {
      res: { isSent: false }
    })
    await fns
    expect(counter).toEqual(3)
  })
  it('stop on ctx.res.isSent', async () => {
    let counter = 0
    const fns = reducer([
      (ctx) => counter++,
      (ctx) => {
        counter++
        ctx.res.isSent = true
      },
      (ctx) => counter++,
    ], {
      res: { isSent: false }
    })
    await fns
    expect(counter).toEqual(2)
  })
  it('catch error in promises chain', async () => {
    let counter = 0
    const fns = reducer([
      (ctx) => { throw new Error('Error') },
      (ctx) => counter++
    ], {
      res: { isSent: false }
    })
    try {
      await fns
    } catch (e) {
      expect(e.message).toEqual('Error')
    }
    expect(counter).toEqual(0)
  })
})

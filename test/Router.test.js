const Router = require('../lib/Router')
const { executeS } = require('../lib/symbols')

describe('Router', () => {
  const handler = (ctx) => ctx.test = true

  describe('define route with prefix and execute', () => {
    const router = new Router({ prefix: '/api' }).get('/test', handler)

    it('GET /api/test', () => {
      const ctx = {
        request: { method: 'GET', originalUrl: '/api/test' },
        test: false
      }
      router[executeS](ctx)[0](ctx)
      expect(ctx.test).toBe(true)
    })
  })
  describe('execute handler by route', () => {
    const router = new Router().get('/test', handler)

    it('GET /test', async () => {
      const ctx = {
        request: { method: 'GET', originalUrl: '/test' },
        test: false
      }
      router[executeS](ctx)[0](ctx)
      expect(ctx.test).toEqual(true)
    })
  })
  describe('merge', () => {
    const router1 = new Router({ prefix: '/api' })
    const router2 = new Router().get('/test', handler)
    router1.merge(router2)

    it('GET /test', () => {
      const ctx = {
        request: { method: 'GET', originalUrl: '/api/test' },
        test: false
      }
      router1[executeS](ctx)[0](ctx)
      expect(ctx.test).toEqual(true)
    })
  })
  describe('not found', () => {
    const router = new Router().setNotFoundHandler(() => 'mock')

    it('GET /not/found', () => {
      const ctx = {
        request: { method: 'GET', originalUrl: '/not/found' }
      }
      expect(router[executeS](ctx)).toEqual('mock')
    })
  })
})

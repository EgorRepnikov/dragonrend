const { routing } = require('..')
const { executeS } = require('../lib/symbols')

describe('Router', () => {
  const handler = ctx => ctx.test = true

  describe('define route with prefix and execute', () => {
    const router = routing({ prefix: '/api' }).GET('/test', handler)
    it('GET /api/test', () => {
      const ctx = {
        request: { method: 'GET', url: '/api/test' },
        test: false
      }
      router[executeS](ctx)[0](ctx)
      expect(ctx.test).toBe(true)
    })
  })
  describe('execute handler by route', () => {
    const router = routing().GET('/test', handler)
    it('GET /test', async () => {
      const ctx = {
        request: { method: 'GET', url: '/test' },
        test: false
      }
      router[executeS](ctx)[0](ctx)
      expect(ctx.test).toEqual(true)
    })
  })
  describe('not found (set via config)', () => {
    const router = routing({
      notFoundHandler: () => 'mock'
    })
    it('GET /not/found', () => {
      const ctx = {
        request: { method: 'GET', url: '/not/found' }
      }
      expect(router[executeS](ctx)).toEqual('mock')
    })
  })
  describe('not found (set via function)', () => {
    const router = routing()
    const { NOT_FOUND } = router
    NOT_FOUND(() => 'mock')
    it('GET /not/found', () => {
      const ctx = {
        request: { method: 'GET', url: '/not/found' }
      }
      expect(router[executeS](ctx)).toEqual('mock')
    })
  })
})

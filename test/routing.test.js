const { routify, GET } = require('../')
const { executeS } = require('../lib/symbols')

describe('Router', () => {
  const handler = (ctx) => ctx.test = true

  describe('define route with prefix and execute', () => {
    const router = routify({ prefix: '/api' })([[GET, '/test', handler]])
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
    const router = routify()([[GET, '/test', handler]])
    it('GET /test', async () => {
      const ctx = {
        request: { method: 'GET', originalUrl: '/test' },
        test: false
      }
      router[executeS](ctx)[0](ctx)
      expect(ctx.test).toEqual(true)
    })
  })
  describe('not found', () => {
    const router = routify({
      notFoundHandler: () => 'mock'
    })()
    it('GET /not/found', () => {
      const ctx = {
        request: { method: 'GET', originalUrl: '/not/found' }
      }
      expect(router[executeS](ctx)).toEqual('mock')
    })
  })
})

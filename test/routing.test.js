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
    it('GET /not/found', async () => {
      let isSent = false
      const router = routing({
        notFoundHandler() {
          isSent = true
        }
      })
      const ctx = {
        request: { method: 'GET', url: '/not/found' }
      }
      await router[executeS](ctx)
      expect(isSent).toBe(true)
    })
  })
  describe('not found (set via function)', () => {
    it('GET /not/found', async () => {
      let isSent = false
      const router = routing()
      const { NOT_FOUND } = router
      NOT_FOUND(() => {
        isSent = true
      })
      const ctx = {
        request: { method: 'GET', url: '/not/found' }
      }
      await router[executeS](ctx)
      expect(isSent).toBe(true)
    })
  })
})

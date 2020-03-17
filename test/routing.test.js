const { routing } = require('..')

describe('Router', () => {
  const handler = ctx => ctx.test = true

  describe('define route with prefix and execute', () => {
    const router = routing({ prefix: '/api' }).get('/test', handler)
    it('GET /api/test', () => {
      const ctx = {
        request: { method: 'GET', path: '/api/test' },
        test: false
      }
      router._find(ctx)[0](ctx)
      expect(ctx.test).toBe(true)
    })
  })
  describe('execute handler by route', () => {
    const router = routing().get('/test', handler)
    it('GET /test', async () => {
      const ctx = {
        request: { method: 'GET', path: '/test' },
        test: false
      }
      router._find(ctx)[0](ctx)
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
        request: { method: 'GET', path: '/not/found' }
      }
      await router._find(ctx)[0](ctx)
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
        request: { method: 'GET', path: '/not/found' }
      }
      await router._find(ctx)[0](ctx)
      expect(isSent).toBe(true)
    })
  })
})

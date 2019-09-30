const Router = require('../lib/Router')

describe('Router', () => {
  const handler = 'mock'
  const expected = { handler: [handler], query: {} }

  describe('define routes and find', () => {
    const router = new Router()

    router.get('/test', handler)
    router.post('/test', handler)
    router.put('/test', handler)
    router.patch('/test', handler)
    router.head('/test', handler)
    router.options('/test', handler)
    router.delete('/test', handler)

    it('get', () => expect(router.find('GET', '/test')).toEqual(expected))
    it('post', () => expect(router.find('POST', '/test')).toEqual(expected))
    it('put', () => expect(router.find('PUT', '/test')).toEqual(expected))
    it('patch', () => expect(router.find('PATCH', '/test')).toEqual(expected))
    it('head', () => expect(router.find('HEAD', '/test')).toEqual(expected))
    it('options', () => expect(router.find('OPTIONS', '/test')).toEqual(expected))
    it('delete', () => expect(router.find('DELETE', '/test')).toEqual(expected))
  })
  describe('define route with prefix and find', () => {
    describe('with slash', () => {
      const router = new Router({ prefix: '/api' })
      router.get('/test', handler)

      it('GET /api/test', () => {
        expect(router.find('GET', '/api/test'))
          .toEqual(expected)
      })
    })
  })
  describe('define route with slash at the end', () => {
    const router = new Router()
    router.get('/test/123/', handler)

    it('GET /test/123', () => {
      expect(router.find('GET', '/test/123')).toEqual(expected)
    })
    it('GET /test/123/', () => {
      expect(router.find('GET', '/test/123/')).toEqual(expected)
    })
  })
  describe('define route without slash at the end', () => {
    const router = new Router()
    router.get('/test/123', handler)

    it('GET /test/123', () => {
      expect(router.find('GET', '/test/123')).toEqual(expected)
    })
    it('GET /test/123/', () => {
      expect(router.find('GET', '/test/123/')).toEqual(expected)
    })
  })
  describe('execute handler by route', () => {
    const router = new Router()
    router.get('/test', (ctx) => ctx.test = true)

    it('GET /test', async () => {
      const ctx = {
        req: { method: 'GET', url: '/test' },
        res: { isSent: false },
        test: false
      }
      await router.execute(ctx)
      expect(ctx.test).toEqual(true)
    })
  })
  describe('merge', () => {
    const router1 = new Router({ prefix: '/api' })
    const router2 = new Router()
    router2.get('/test', handler)
    router1.merge(router2)

    it('GET /test', () => {
      expect(router1.find('GET', '/api/test')).toEqual(expected)
    })
  })
  describe('not found', () => {
    const router = new Router()
    router.setNotFoundHandler(() => 'mock')

    it('GET /not/found', () => {
      const ctx = {
        req: { method: 'GET', url: '/not/found' },
        res: { isSent: false }
      }
      expect(router.execute(ctx)).toEqual('mock')
    })
  })
})

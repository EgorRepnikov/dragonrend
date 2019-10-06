const Router = require('../lib/Router')

describe('Router', () => {
  const handler = 'mock'
  const expected = { handler: [handler], query: {} }

  describe('define routes and find', () => {
    const router = new Router()
      .get('/test', handler)
      .post('/test', handler)
      .put('/test', handler)
      .patch('/test', handler)
      .head('/test', handler)
      .options('/test', handler)
      .delete('/test', handler)

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
      const router = new Router({ prefix: '/api' }).get('/test', handler)

      it('GET /api/test', () => {
        expect(router.find('GET', '/api/test')).toEqual(expected)
      })
    })
  })
  describe('define route with slash at the end', () => {
    const router = new Router().get('/test/123/', handler)

    it('GET /test/123', () => {
      expect(router.find('GET', '/test/123')).toEqual(expected)
    })
    it('GET /test/123/', () => {
      expect(router.find('GET', '/test/123/')).toEqual(expected)
    })
  })
  describe('execute handler by route', () => {
    const router = new Router().get('/test', (ctx) => ctx.test = true)

    it('GET /test', async () => {
      const ctx = {
        request: { method: 'GET', originalUrl: '/test' },
        test: false
      }
      router.execute(ctx)[0](ctx)
      expect(ctx.test).toEqual(true)
    })
  })
  describe('merge', () => {
    const router1 = new Router({ prefix: '/api' })
    const router2 = new Router().get('/test', handler)
    router1.merge(router2)

    it('GET /test', () => {
      expect(router1.find('GET', '/api/test')).toEqual(expected)
    })
  })
  describe('not found', () => {
    const router = new Router().setNotFoundHandler(() => 'mock')

    it('GET /not/found', () => {
      const ctx = {
        request: { method: 'GET', originalUrl: '/not/found' }
      }
      expect(router.execute(ctx)).toEqual('mock')
    })
  })
})

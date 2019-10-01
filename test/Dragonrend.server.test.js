const rp = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  baseUrl: 'http://localhost:8080/'
})

const Dragonrend = require('../lib/Dragonrend')

describe('Dragonrend Server', () => {
  describe('default', () => {
    const dragonrend = new Dragonrend()
    dragonrend.get('/default', () => {})
    dragonrend.get('/error', () => { throw new Error() })
    const server = dragonrend.toServer()

    beforeAll(() => server.listen(8080))
    afterAll(() => server.close())

    it('GET /not/found', async () => {
      const res = await rp('not/found')
      expect(res.statusCode).toEqual(404)
      expect(res.body).toEqual('Not Found')
    })
    it('GET /default', async () => {
      const res = await rp('default')
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual('OK')
    })
    it('GET /error', async () => {
      const res = await rp('error')
      expect(res.statusCode).toEqual(500)
      expect(res.body).toEqual('Internal Server Error')
    })
  })
  describe('custom', () => {
    const dragonrend = new Dragonrend()
    dragonrend.setErrorHandler((e, { res }) => {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: e.message }))
    })
    dragonrend.setRootHandler((ctx) => {
      const { res, status, body } = ctx
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    })
    dragonrend.get('/json', ({ res }) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end('{"message":"Hello There"}')
    })
    dragonrend.get('/error', () => { throw new Error('Mock') })
    dragonrend.get('/root-handler', (ctx) => {
      ctx.status = 200
      ctx.body = { 'message': 'Hello There' }
    })
    const server = dragonrend.toServer()

    beforeAll(() => server.listen(8080))
    afterAll(() => server.close())

    it('GET /json', async () => {
      const res = await rp('json', { json: true })
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({ message: 'Hello There' })
    })
    it('GET /error', async () => {
      const res = await rp('error', { json: true })
      expect(res.statusCode).toEqual(500)
      expect(res.body).toEqual({ error: 'Mock' })
    })
    it('GET /root-handler', async () => {
      const res = await rp('root-handler', { json: true })
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({ message: 'Hello There' })
    })
  })
})

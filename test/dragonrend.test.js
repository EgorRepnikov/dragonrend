const rp = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  baseUrl: 'http://localhost:8080/'
})

const { dragonrend } = require('../lib/dragonrend')

describe('Dragonrend Server', () => {
  describe('default', () => {
    const app = dragonrend()
    const { GET } = app
    GET('/default', () => {})
    GET('/error', () => { throw new Error() })

    beforeAll(async () => await app.start(8080))
    afterAll(async () => await app.stop())

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
    const app = dragonrend({
      errorHandler(e, ctx) {
        ctx.response.status(500).json({ error: e.message })
      }
    })
    const { GET } = app
    GET('/json', (ctx) => 
        ctx.response.status(200).json({ message: 'Hello There' }))
    GET('/error', () => { throw new Error('Mock') })

    beforeAll(async () => await app.start(8080))
    afterAll(async () => await app.stop())

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
  })
  describe('error set via function', () => {
    const app = dragonrend()
    const { CATCH_ERROR, GET } = app
    CATCH_ERROR((e, ctx) => ctx.response.status(500).json({ error: e.message }))
    GET('/error', () => { throw new Error('Mock') })

    beforeAll(async () => await app.start(8080))
    afterAll(async () => await app.stop())

    it('GET /error', async () => {
      const res = await rp('error', { json: true })
      expect(res.statusCode).toEqual(500)
      expect(res.body).toEqual({ error: 'Mock' })
    })
  })
})

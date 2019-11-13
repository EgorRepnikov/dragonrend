const rp = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  baseUrl: 'http://localhost:8080/'
})

const Dragonrend = require('../lib/Dragonrend')

describe('Dragonrend Server', () => {
  describe('default', () => {
    const dragonrend = { GET } = new Dragonrend()
    GET('/default', () => {})
    GET('/error', () => { throw new Error() })

    beforeAll(async () => await dragonrend.start(8080))
    afterAll(async () => await dragonrend.stop())

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
    const dragonrend = { GET } = new Dragonrend()
      .setErrorHandler((e, ctx) => {
        ctx.response.status(500).json({ error: e.message })
      })
    GET('/json', (ctx) => 
        ctx.response.status(200).json({ message: 'Hello There' }))
    GET('/error', () => { throw new Error('Mock') })

    beforeAll(async () => await dragonrend.start(8080))
    afterAll(async () => await dragonrend.stop())

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
})

const rp = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  baseUrl: 'http://localhost:8080/'
})

const Dragonrend = require('../lib/Dragonrend')

describe('Dragonrend Server', () => {
  describe('default', () => {
    const dragonrend = new Dragonrend()
      .get('/default', () => {})
      .get('/error', () => { throw new Error() })

    beforeAll(async () => await dragonrend.listen(8080))
    afterAll(async () => await dragonrend.close())

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
      .setErrorHandler((e, { response }) => {
        response.status(500).json({ error: e.message })
      })
      .get('/json', ({ response }) => {
        response.status(200).json({ message: 'Hello There' })
      })
      .get('/error', () => { throw new Error('Mock') })

    beforeAll(async () => await dragonrend.listen(8080))
    afterAll(async () => await dragonrend.close())

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

const rp = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  baseUrl: 'http://localhost:8080/'
})

const Dragonrend = require('../lib/Dragonrend')

describe('Request', () => {
  const dragonrend = new Dragonrend()
    .get('/test', ({ request, response }) => response.json(request))
    .post('/test-body', ({ request, response }) => response.json(request))

  beforeAll(async () => await dragonrend.start(8080))
  afterAll(async () => await dragonrend.stop())

  it('get request', async () => {
    const res = await rp.get('test', { json: true })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      method: 'GET',
      originalUrl: '/test',
      headers: {
        accept: 'application/json',
        host: 'localhost:8080',
        connection: 'close'
      },
      query: {}
    })
  })
  it('get request with json body', async () => {
    const res = await rp.post('test-body', {
      body: { message: 'Test' },
      json: true
    })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      method: 'POST',
      originalUrl: '/test-body',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'content-length': '18',
        host: 'localhost:8080',
        connection: 'close'
      },
      query: {},
      rawBody: '{"message":"Test"}',
      body: { message: 'Test' }
    })
  })
  it('get request with text body', async () => {
    const res = await rp.post('test-body', {
      body: 'Test'
    })
    expect(res.statusCode).toEqual(200)
    expect(JSON.parse(res.body)).toEqual({
      method: 'POST',
      originalUrl: '/test-body',
      headers: {
        'content-length': '4',
        host: 'localhost:8080',
        connection: 'close'
      },
      query: {},
      rawBody: 'Test',
      body: 'Test'
    })
  })
})

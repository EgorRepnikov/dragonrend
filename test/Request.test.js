const rp = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  baseUrl: 'http://localhost:8080/'
})

const { dragonrend } = require('..')

describe('Request', () => {
  const app = dragonrend()
  const { GET, POST } = app
  GET('/test', ({ request: { raw, ...request }, response }) => response.json(request))
  POST('/test-body', async ({ request: { raw, ...request }, response }) => {
    await request.body()
    response.json(request)
  })

  beforeAll(async () => await app.start(8080))
  afterAll(async () => await app.stop())

  it('get request', async () => {
    const res = await rp.get('test', { json: true })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      method: 'GET',
      url: '/test',
      headers: {
        accept: 'application/json',
        host: 'localhost:8080',
        connection: 'close'
      },
      path: '/test',
      _query: false,
      _body: false
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
      url: '/test-body',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'content-length': '18',
        host: 'localhost:8080',
        connection: 'close'
      },
      path: '/test-body',
      _query: false,
      _body: { message: 'Test' }
    })
  })
  it('get request with text body', async () => {
    const res = await rp.post('test-body', {
      body: 'Test'
    })
    expect(res.statusCode).toEqual(200)
    expect(JSON.parse(res.body)).toEqual({
      method: 'POST',
      url: '/test-body',
      headers: {
        'content-length': '4',
        host: 'localhost:8080',
        connection: 'close'
      },
      path: '/test-body',
      _query: false,
      _body: 'Test'
    })
  })
})

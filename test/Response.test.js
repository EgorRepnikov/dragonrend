const rp = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  baseUrl: 'http://localhost:8080/'
})

const Dragonrend = require('../lib/Dragonrend')

describe('Request', () => {
  const dragonrend = new Dragonrend()
    .get('/default', () => {})
    .get('/status', ({ response }) => response.status(201).text(''))
    .get('/json-body', ({ response }) => response.json({ message: 'test' }))
    .get('/text-body', ({ response }) => response.text('test'))
    .get('/html-body', ({ response }) => response.html('<h1>test</h1>'))
    .get('/status-json-body', ({ response }) =>
      response.status(201).json({ message: 'test' }))

  beforeAll(async () => await dragonrend.listen(8080))
  afterAll(async () => await dragonrend.close())

  it('get default response', async () => {
    const res = await rp.get('default')
    expect(res.statusCode).toEqual(200)
    expect(res.headers['content-type']).toEqual('text/plain')
    expect(res.body).toEqual('OK')
  })
  it('get response with custom status', async () => {
    const res = await rp.get('status')
    expect(res.statusCode).toEqual(201)
    expect(res.headers['content-type']).toEqual('text/plain')
    expect(res.body).toEqual('')
  })
  it('get request with json body', async () => {
    const res = await rp.get('json-body', { json: true })
    expect(res.statusCode).toEqual(200)
    expect(res.headers['content-type']).toEqual('application/json')
    expect(res.body).toEqual({ message: 'test' })
  })
  it('get request with text body', async () => {
    const res = await rp.get('text-body', { json: true })
    expect(res.statusCode).toEqual(200)
    expect(res.headers['content-type']).toEqual('text/plain')
    expect(res.body).toEqual('test')
  })
  it('get request with html body', async () => {
    const res = await rp.get('html-body', { json: true })
    expect(res.statusCode).toEqual(200)
    expect(res.headers['content-type']).toEqual('text/html')
    expect(res.body).toEqual('<h1>test</h1>')
  })
  it('get request with custom status and json body', async () => {
    const res = await rp.get('status-json-body', { json: true })
    expect(res.statusCode).toEqual(201)
    expect(res.headers['content-type']).toEqual('application/json')
    expect(res.body).toEqual({ message: 'test' })
  })
})
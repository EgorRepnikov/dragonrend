const rp = require('request-promise').defaults({
  resolveWithFullResponse: true,
  simple: false,
  baseUrl: 'http://localhost:8080/'
})

const Dragonrend = require('../../lib/Dragonrend')

describe('Routes Auto Including', () => {
  const dragonrend = new Dragonrend({
    routesDir: 'test/auto-including-tasks/routes',
    middlewareDir: 'test/auto-including-tasks/middleware',
    contentTypeParsersDir: 'test/auto-including-tasks/parsers'
  })

  beforeAll(async () => await dragonrend.start(8080))
  afterAll(async () => await dragonrend.stop())

  it('GET /router1 (Router1)', async () => {
    const res = await rp('router1')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual('router1')
  })

  it('GET /router2 (Router2)', async () => {
    const res = await rp('router2')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual('router2')
  })

  it('GET /middleware1 (middleware1)', async () => {
    const res = await rp('router1?middleware1=lel')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual('middleware1')
  })

  it('GET /middleware2 (middleware2)', async () => {
    const res = await rp('router2?middleware2=kek')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual('middleware2')
  })

  it('GET /parser (textPlain)', async () => {
    const res = await rp.post('parser', {
      headers: {
        'content-type': 'text/plain'
      },
      body: 'hi there'
    })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual('HI THERE')
  })
})

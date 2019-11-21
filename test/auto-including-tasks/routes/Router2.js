const { routing } = require('../../../lib/routing')

module.exports = { GET } = routing()

GET('/router2', (ctx) => ctx.response.text('router2'))

const { routing } = require('../../../lib/routing')

module.exports = { GET } = routing()


GET('/router1', (ctx) => ctx.response.text('router1'))

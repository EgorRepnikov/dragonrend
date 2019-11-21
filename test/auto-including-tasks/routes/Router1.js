const { routing } = require('../../..')

module.exports = { GET } = routing()


GET('/router1', (ctx) => ctx.response.text('router1'))

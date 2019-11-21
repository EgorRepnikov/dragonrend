const { routing } = require('../../../lib/routing')

module.exports = { POST } = routing()

POST('/parser', (ctx) => ctx.response.text(ctx.request.body))

const { routing } = require('../../..')

module.exports = { POST } = routing()

POST('/parser', (ctx) => ctx.response.text(ctx.request.body))

const { routing } = require('../../..')

const routes = routing()

const { POST } = routes

POST('/parser', ctx => ctx.response.text(ctx.request.body))

module.exports = routes
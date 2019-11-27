const { routing } = require('../../..')

const routes = routing()

const { GET } = routes

GET('/router2', ctx => ctx.response.text('router2'))

module.exports = routes

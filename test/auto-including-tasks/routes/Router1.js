const { routing } = require('../../..')

const routes = routing()

const { GET } = routes

GET('/router1', (ctx) => ctx.response.text('router1'))

module.exports = routes

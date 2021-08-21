const { routing } = require('../../..')

const routes = routing()

const { POST } = routes

POST('/parser', async ctx => ctx.response.text(await ctx.request.body()))

module.exports = routes
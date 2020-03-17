module.exports = ctx =>
  ctx.request.query.middleware1 && ctx.response.text('middleware1')

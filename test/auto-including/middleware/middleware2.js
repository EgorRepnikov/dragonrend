module.exports = ctx =>
  ctx.request.query.middleware2 && ctx.response.text('middleware2')

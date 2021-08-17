module.exports = (ctx, next) => {
  return ctx.request.query().middleware1 ? ctx.response.text('middleware1') : next()
}

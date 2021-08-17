module.exports = (ctx, next) => {
  return ctx.request.query().middleware2 ? ctx.response.text('middleware2') : next()
}

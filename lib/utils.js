const { isSentS, sendS } = require('./symbols')

exports.reduce = (array, ctx) => {
  return array.reduce((previous, current) => {
    return previous.then(() => !ctx.response[isSentS] && current(ctx))
  }, Promise.resolve())
}

exports.wrapMiddleware = middleware => ctx => {
  return Promise.resolve(middleware(ctx)).then(res => {
    if (res) {
      const { status = 200, headers = {}, body = '' } = res
      ctx.response.status(status)
      for (const header in headers) {
        ctx.response.header(header, headers[header])
      }
      ctx.response[sendS](body)
    }
  })
}

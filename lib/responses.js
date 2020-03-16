const { sendS } = require('./symbols')

const overload = [
  undefined,
  args => ({
    body: args[0],
    headers: {}
  }),
  args => ({
    status: args[0],
    body: args[1],
    headers: {}
  }),
  args => ({
    status: args[0],
    headers: args[1],
    body: args[2]
  })
]

function response(args) {
  return overload[args.length](args)
}

module.exports = {
  json(...args) {
    const res = response(args)
    res.headers['content-type'] = 'application/json'
    res.body = JSON.stringify(res.body)
    return res
  },
  text(...args) {
    const res = response(args)
    res.headers['content-type'] = 'text/plain'
    return res
  },
  html(...args) {
    const res = response(args)
    res.headers['content-type'] = 'text/html'
    return res
  },
  wrap(middleware) {
    return ctx => Promise.resolve(middleware(ctx)).then(res => {
      if (res) {
        const { status = 200, headers = {}, body = '' } = res
        ctx.response.status(status)
        for (const header in headers) {
          ctx.response.header(header, headers[header])
        }
        ctx.response[sendS](body)
        return false
      }
    })
  }
}

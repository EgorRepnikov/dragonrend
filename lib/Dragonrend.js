const http = require('http')

const Router = require('./Router')
const reducer = require('./reducer')

module.exports = class Dragonrend extends Router {

  constructor() {
    super()
    this.baseContext = {}
    this.handlers = []
    this.rootHandler = defaultRootHandler
    this.errorHandler = defaultErrorHandler
  }

  middleware(...fns) {
    for (const fn of fns) {
      this.handlers.push(fn)
    }
  }

  setRootHandler(fn) {
    this.rootHandler = fn
  }

  setErrorHandler(fn) {
    this.errorHandler = fn
  }

  toListener() {
    this.middleware(this.execute.bind(this))
    const fns = this.handlers
    return (req, res) => {
      const ctx = Object.create(this.baseContext)
      ctx.req = req
      ctx.res = res
      reducer(fns, ctx)
        .then(() => this.rootHandler(ctx))
        .catch((e) => this.errorHandler(e, ctx))
    }
  }

  toServer() {
    return http.createServer(this.toListener())
  }
}

function defaultRootHandler({ res }) {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('OK')
}

function defaultErrorHandler(e, { res }) {
  console.log(e)
  res.writeHead(500, { 'Content-Type': 'text/plain' })
  res.end('Internal Server Error')
}

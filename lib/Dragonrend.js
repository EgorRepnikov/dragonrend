const Router = require('./Router')

const combine = require('./combine')

module.exports = class Dragonrend extends Router {

  constructor() {
    super()
    this.handlers = []
    this.rootHandler = defaultRootHandler
    this.errorHandler = defaultErrorHandler
  }

  handler(fn) {
    this.handlers.push(fn)
  }

  setRootHandler(fn) {
    this.rootHandler = fn
  }

  setErrorHandler(fn) {
    this.errorHandler = fn
  }

  toListener() {
    const fns = new Set([
      ...this.handlers,
      this.execute.bind(this)
    ])
    return (req, res) => {
      const ctx = { req, res }
      combine(fns, ctx)
        .then(() => this.rootHandler(ctx))
        .catch((e) => this.errorHandler(e, ctx))
    }
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

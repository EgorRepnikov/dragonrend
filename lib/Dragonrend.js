const Router = require('./Router')

const combine = require('./combine')

module.exports = class Dragonrend extends Router {

  constructor() {
    super()
    this.handlersBefore = []
    this.handlersAfter = []
    this.errorHandler = defaultErrorHandler
  }

  addHandlerBefore(fn) {
    this.handlersBefore.push(fn)
  }

  addHandlerAfter(fn) {
    this.handlersAfter.push(fn)
  }

  setErrorHandler(handler) {
    this.errorHandler = handler
  }

  toListener() {
    const fns = new Set([
      ...this.handlersBefore,
      (ctx) => this.execute(ctx),
      ...this.handlersAfter
    ])
    return (req, res) => {
      const ctx = { req, res }
      combine(fns, ctx).catch((e) => this.errorHandler(e, ctx))
    }
  }
}

function defaultErrorHandler(e, { res }) {
  console.log(e)
  res.writeHead(500, { 'Content-Type': 'application/json' })
  res.end('{"error":"Internal Server Error"}')
}

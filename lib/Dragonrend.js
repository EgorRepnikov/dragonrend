const Router = require('./Router')

function defaultErrorHandler(e, { res }) {
  res.writeHead(500, { 'Content-Type': 'application/json' })
  res.end('{"error":"Internal Server Error"}')
}

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
      (data) => this.execute(data),
      ...this.handlersAfter
    ])
    return async (req, res) => {
      const data = { req, res }
      for (const fn of fns) {
        if (!res.headersSent) {
          try {
            await fn(data)
          } catch(e) {
            await this.errorHandler(e, data)
          }
        }
      }
    }
  }
}

const Router = require('./Router')

setReduce = function(set, cb, initial) {
  let result = initial
  set.forEach((value) => result = cb(result, value))
  return result
}

function defaultErrorHandler(e, { res }) {
  console.log(e)
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
    const fns = [
      ...this.handlersBefore,
      (data) => this.execute(data),
      ...this.handlersAfter
    ]
    return (req, res) => {
      const data = { req, res }
      setReduce(fns, (previous, current) => {
        if (data.res.headersSent) {
          return Promise.resolve()
        } else {
          return previous.then(() => current(data))
        }
      }, Promise.resolve())
        .catch((e) => this.errorHandler(e, data))
    }
  }
}

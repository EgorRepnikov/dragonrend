const http = require('http')

const Router = require('./Router')
const Response = require('./Response')
const RequestFactory = require('./RequestFactory')
const { reduce } = require('./utils')

module.exports = class Dragonrend extends Router {

  constructor() {
    super()
    this.baseContext = {}
    this.handlers = []
    this.errorHandler = defaultErrorHandler
    this.requestFactory = new RequestFactory()
  }

  middleware(...fns) {
    for (const fn of fns) {
      this.handlers.push(fn)
    }
    return this
  }

  addContentTypeParser(contentType, fn) {
    this.requestFactory.addContentTypeParser(contentType, fn)
    return this
  }

  setErrorHandler(fn) {
    this.errorHandler = fn
    return this
  }

  toListener() {
    return (req, res) => {
      const ctx = Object.create(this.baseContext)
      this.requestFactory.createRequest(req)
        .then((request) => ctx.request = request)
        .then(() => {
          ctx.response = new Response(res)
          const routeHandlers = this.execute(ctx)
          const handlers = this.handlers.concat(routeHandlers)
          handlers.push((ctx) => !ctx.response.isSent && ctx.response.status(200).text('OK'))
          return reduce(handlers, ctx)
        })
        .catch((e) => this.errorHandler(e, ctx))
    }
  }

  listen(portOrOptions) {
    this.server = http.createServer(this.toListener())
    return new Promise((resolve) => {
      this.server.listen(portOrOptions, () => resolve())
    })
  }

  close() {
    return new Promise((resolve) => {
      this.server.close(() => resolve())
    })
  }
}

function defaultErrorHandler(e, { response }) {
  console.log(e)
  response.status(500).text('Internal Server Error')
}

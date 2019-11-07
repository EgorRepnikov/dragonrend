const http = require('http')

const Router = require('./Router')
const Response = require('./Response')
const RequestFactory = require('./RequestFactory')
const { reduce } = require('./utils')

const {
  baseContextS,
  handlersS,
  errorHandlerS,
  requestFactoryS,
  createListenerS,
  serverS
} = require('./symbols')

module.exports = class Dragonrend extends Router {

  constructor() {
    super()
    this[baseContextS] = {}
    this[handlersS] = []
    this[errorHandlerS] = defaultErrorHandler
    this[requestFactoryS] = new RequestFactory()
  }

  middleware(...fns) {
    for (const fn of fns) {
      this[handlersS].push(fn)
    }
    return this
  }

  context(key, value) {
    this[baseContextS][key] = value
    return this
  }

  addContentTypeParser(contentType, fn) {
    this[requestFactoryS].addContentTypeParser(contentType, fn)
    return this
  }

  setErrorHandler(fn) {
    this[errorHandlerS] = fn
    return this
  }

  [createListenerS]() {
    return (req, res) => {
      const ctx = Object.create(this[baseContextS])
      this[requestFactoryS].createRequest(req)
        .then((request) => ctx.request = request)
        .then(() => {
          ctx.response = new Response(res)
          const routeHandlers = this.execute(ctx)
          const handlers = this[handlersS].concat(routeHandlers)
          handlers.push((ctx) =>
            !ctx.response.isSent && ctx.response.status(200).text('OK'))
          return reduce(handlers, ctx)
        })
        .catch((e) => this[errorHandlerS](e, ctx))
    }
  }

  start(portOrOptions) {
    this[serverS] = http.createServer(this[createListenerS]())
    return new Promise((resolve) => {
      this[serverS].listen(portOrOptions, () => resolve())
    })
  }

  close() {
    return new Promise((resolve) => {
      this[serverS].close(() => resolve())
    })
  }
}

function defaultErrorHandler(e, { response }) {
  console.log(e)
  response.status(500).text('Internal Server Error')
}

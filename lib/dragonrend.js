const http_ = require('http')
const https_ = require('https')
const http2_ = require('http2')

const { initTasks } = require('./autoIncluding')
const RequestFactory = require('./RequestFactory')
const Response = require('./Response')
const { Router } = require('./routing')
const { reduce, wrapMiddleware } = require('./utils')

const {
  baseContextS,
  middlewareS,
  errorHandlerS,
  requestFactoryS,
  createListenerS,
  tasksS,
  serverS,
  executeS
} = require('./symbols')

class Dragonrend extends Router {

  constructor({ server, routing, autoIncluding, errorHandler }) {
    super(routing)
    this[serverS] = server
    this[tasksS] = initTasks(autoIncluding)
    this[requestFactoryS] = new RequestFactory()
    this[baseContextS] = {}
    this[middlewareS] = []
    this.setErrorHandler(errorHandler)
    //
    this.MIDDLEWARE = (...fns) => this.middleware(...fns)
    this.CONTEXT = (key, value) => this.context(key, value)
    this.PARSER = (contentType, handler) => this.addContentTypeParser(contentType, handler)
    this.CATCH_ERROR = handler => this.setErrorHandler(handler)
    this.START = (portOrOptions, cb) => this.start(portOrOptions, cb)
    this.STOP = cb => this.stop(cb)
  }

  middleware(...fns) {
    for (const fn of fns) {
      this[middlewareS].push(wrapMiddleware(fn))
    }
    return this
  }

  context(object) {
    for (const key in object) {
      this[baseContextS][key] = object[key]
    }
    return this
  }

  addContentTypeParser(contentType, handler) {
    this[requestFactoryS].addContentTypeParser(contentType, handler)
    return this
  }

  setErrorHandler(handler) {
    this[errorHandlerS] = (e, ctx) => wrapMiddleware(() => handler(e, ctx))(ctx)
    return this
  }

  [createListenerS]() {
    this[tasksS](this)
    return (req, res) => {
      const ctx = Object.create(this[baseContextS])
      this[requestFactoryS]
        .createRequest(req)
        .then(request => {
          ctx.request = request
          ctx.response = new Response(res)
          const routeHandlers = this[executeS](ctx)
          const middleware = this[middlewareS].concat(routeHandlers)
          middleware.push(ctx => ctx.response.status(200).text('OK'))
          return reduce(middleware, ctx)
        })
        .catch(error => this[errorHandlerS](error, ctx))
    }
  }

  start(portOrOptions, cb = false) {
    this[serverS].on('request', this[createListenerS]())
    if (!cb) {
      return new Promise(resolve => {
        this[serverS].listen(portOrOptions, () => resolve())
      })
    }
    this[serverS].listen(portOrOptions, cb)
  }

  stop(cb = false) {
    if (!cb) {
      return new Promise(resolve => {
        this[serverS].close(() => resolve())
      })
    }
    this[serverS].close(cb)
  }
}

exports.dragonrend = ({
  server = false,
  https = false,
  http2 = false,
  routing = {},
  autoIncluding = false,
  errorHandler = defaultErrorHandler
} = {}) => {
  const createServer = () => {
    if (http2) {
      return https ? http2_.createSecureServer(https) : http2_.createServer()
    } else if (https) {
      return https_.createServer(https)
    } else {
      return http_.createServer()
    }
  }
  if (!server) {
    server = createServer()
  }
  return new Dragonrend({ server, routing, autoIncluding, errorHandler })
}

function defaultErrorHandler(e, ctx) {
  console.log(e)
  ctx.response.status(500).text('Internal Server Error')
}

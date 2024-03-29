const http_ = require('http')
const https_ = require('https')
const http2_ = require('http2')

const { initTasks } = require('./auto-including')
const { RequestFactory } = require('./request-factory')
const { Router } = require('./routing')
const { createResponse, compose } = require('./utils')

class Dragonrend extends Router {

  constructor({ server, routing, autoIncluding, errorHandler }) {
    super(routing)
    this._server = server
    this._tasks = initTasks(autoIncluding)
    this._requestFactory = new RequestFactory()
    this._baseContext = {}
    this._middleware = []
    this.setErrorHandler(errorHandler)
    //
    this.MIDDLEWARE = (...fns) => this.middleware(...fns)
    this.CONTEXT = object => this.context(object)
    this.PARSER = (contentType, handler) => this.addContentTypeParser(contentType, handler)
    this.CATCH_ERROR = handler => this.setErrorHandler(handler)
    this.START = (portOrOptions, cb) => this.start(portOrOptions, cb)
    this.STOP = cb => this.stop(cb)
  }

  middleware(...fns) {
    this._middleware.push(...fns)
    return this
  }

  context(object) {
    for (const key in object) {
      this._baseContext[key] = object[key]
    }
    return this
  }

  addContentTypeParser(contentType, handler) {
    this._requestFactory.addContentTypeParser(contentType, handler)
    return this
  }

  setErrorHandler(handler) {
    this._errorHandler = handler
    return this
  }

  _createListener() {
    this._tasks(this)
    this._wrapRouter()
    return (req, res) => {
      const ctx = {
        ...this._baseContext,
      }
      ctx.request = this._requestFactory.createRequest(req)
      ctx.response = createResponse(res)
      const routeHandler = this._find(ctx)
      return Promise.resolve(routeHandler(ctx))
        .catch(error => this._errorHandler(error, ctx))
    }
  }

  _wrapRouter() {
    const routes = this._tempRoutes
    this._reset()
    for (const [method, path, handlers] of routes) {
      const middlewares = this._middleware.concat(handlers)
      this._add(method, path, compose(middlewares), "")
    }
    this.setNotFoundHandler(compose(this._middleware.concat(this._notFoundHandler)))
  }

  start(portOrOptions, cb = false) {
    this._server.on('request', this._createListener())
    if (!cb) {
      return new Promise(resolve => {
        this._server.listen(portOrOptions, () => resolve())
      })
    }
    this._server.listen(portOrOptions, cb)
  }

  stop(cb = false) {
    if (!cb) {
      return new Promise(resolve => {
        this._server.close(() => resolve())
      })
    }
    this._server.close(cb)
  }
}

exports.dragonrend = ({
  server = false,
  https = false,
  http2 = false,
  noDelay = false,
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
  if (noDelay) {
    server.on('connection', socket => socket.setNoDelay(true))
  }
  return new Dragonrend({ server, routing, autoIncluding, errorHandler })
}

function defaultErrorHandler(e, ctx) {
  console.log(e)
  if (!ctx.response.raw.headersSent) {
    ctx.response.status(500).text('Internal Server Error')
  }
}

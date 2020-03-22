const http_ = require('http')
const https_ = require('https')
const http2_ = require('http2')

const { initTasks } = require('./auto-including')
const { RequestFactory } = require('./request-factory')
const { Router } = require('./routing')
const { createResponse, reduce } = require('./utils')

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
    this.CONTEXT = (key, value) => this.context(key, value)
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
    return (req, res) => {
      const ctx = Object.create(this._baseContext)
      this._requestFactory
        .createRequest(req)
        .then(request => {
          ctx.request = request
          ctx.response = createResponse(res)
          const routeHandlers = this._find(ctx)
          const middleware = this._middleware.concat(routeHandlers)
          middleware.push(ctx => !ctx.response.raw.headersSent && ctx.response.status(200).text('OK'))
          return reduce(middleware, ctx)
        })
        .catch(error => this._errorHandler(error, ctx))
    }
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

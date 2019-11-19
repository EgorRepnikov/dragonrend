const http_ = require('http')
const https_ = require('https')
const http2_ = require('http2')

const { Router } = require('./routing')
const Response = require('./Response')
const RequestFactory = require('./RequestFactory')
const Cluster = require('./Cluster')
const { reduce, initTasks } = require('./utils')

const {
  baseContextS,
  middlewareS,
  errorHandlerS,
  requestFactoryS,
  createListenerS,
  tasksS,
  serverS,
  clusterS,
  executeS
} = require('./symbols')

class Dragonrend extends Router {

  constructor({ server, routing, autoIncluding, errorHandler }) {
    super(routing)
    this[serverS] = server
    this[errorHandlerS] = errorHandler
    this[tasksS] = initTasks(autoIncluding)
    this[requestFactoryS] = new RequestFactory()
    this[baseContextS] = {}
    this[middlewareS] = []
  }

  middleware(...fns) {
    for (const fn of fns) {
      this[middlewareS].push(fn)
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

  [createListenerS]() {
    this[tasksS](this)
    return (req, res) => {
      const ctx = Object.create(this[baseContextS])
      this[requestFactoryS].createRequest(req)
        .then((request) => ctx.request = request)
        .then(() => {
          ctx.response = new Response(res)
          const routeHandlers = this[executeS](ctx)
          const middleware = this[middlewareS].concat(routeHandlers)
          middleware.push((ctx) =>
            !ctx.response.isSent && ctx.response.status(200).text('OK'))
          return reduce(middleware, ctx)
        })
        .catch((e) => this[errorHandlerS](e, ctx))
    }
  }

  start(portOrOptions) {
    const options = typeof portOrOptions === 'object' ?
      portOrOptions :
      { port: portOrOptions }

    this[serverS].on('request', this[createListenerS]())

    if (options.cluster) {
      options.workerFunction = (message) => {
        this[serverS].listen(options, () => console.log(message))
      }
      this[clusterS] = new Cluster(options)
      this[clusterS].start()
      return Promise.resolve()
    } else {
      return new Promise((resolve) => {
        this[serverS].listen(options, () => resolve())
      })
    }
  }

  stop() {
    if (this[serverS]) {
      return new Promise((resolve) => {
        this[serverS].close(() => resolve())
      })
    } else {
      this[clusterS].shutdown()
      return Promise.resolve()
    }
  }
}

exports.dragonrend = ({
  server: {
    https = false,
    http2 = false
  } = {},
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
  const server = createServer()
  return new Dragonrend({ server, routing, autoIncluding, errorHandler })
}

function defaultErrorHandler(e, ctx) {
  console.log(e)
  ctx.response.status(500).text('Internal Server Error')
}

// prefix,
//   notFoundHandler,
//   autoIncluding: {
//     enable,
//     autoIncludeRoutes,
//     routesDir,
//     autoIncludeMiddleware,
//     middlewareDir,
//     autoIncludeContentTypeParsers,
//     contentTypeParsersDir,
//     rootDir
//   } = {}

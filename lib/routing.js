const Impetuous = require('impetuous')

const {
  routerS,
  prefixS,
  tempRoutesS,
  notFoundHandlerS,
  addS,
  executeS
} = require('./symbols')

class Router {

  constructor({ prefix = '', notFoundHandler = defaultNotFoundHandler } = {}) {
    this[routerS] = new Impetuous()
    this[prefixS] = prefix
    this[tempRoutesS] = []
    this[notFoundHandlerS] = notFoundHandler
    //
    this.GET = (path, ...handlers) => this[addS]('GET', path, handlers)
    this.POST = (path, ...handlers) => this[addS]('POST', path, handlers)
    this.PUT = (path, ...handlers) => this[addS]('PUT', path, handlers)
    this.PATCH = (path, ...handlers) => this[addS]('PATCH', path, handlers)
    this.HEAD = (path, ...handlers) => this[addS]('HEAD', path, handlers)
    this.OPTIONS = (path, ...handlers) => this[addS]('OPTIONS', path, handlers)
    this.DELETE = (path, ...handlers) => this[addS]('DELETE', path, handlers)
    //
    this.NOT_FOUND = (handler) => this[notFoundHandlerS] = handler
  }

  merge(...routers) {
    for (const router of routers) {
      for (const { method, path, handler } of router[tempRoutesS]) {
        this[addS](method, path, handler)
      }
    }
    return this
  }

  [addS](method, path, handler) {
    const pathWithPrefix = this[prefixS] + path
    this[tempRoutesS].push({ method, path: pathWithPrefix, handler })
    this[routerS].add(method, pathWithPrefix, handler)
    return this
  }

  [executeS](ctx) {
    const { method, originalUrl } = ctx.request
    const route = this[routerS].find(method, originalUrl)
    if (route === null) {
      return this[notFoundHandlerS](ctx)
    }
    const { params, query, handler } = route
    ctx.request.params = params
    ctx.request.query = query
    return handler
  }
}

function defaultNotFoundHandler(ctx) {
  ctx.response.status(404).text('Not Found')
}

exports.Router = Router

exports.routing = ({ prefix, notFoundHandler } = {}) =>
  new Router({ prefix, notFoundHandler })

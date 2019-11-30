const Impetuous = require('impetuous')

const {
  routerS,
  prefixS,
  tempRoutesS,
  notFoundHandlerS,
  addS,
  executeS
} = require('./symbols')
const { wrapMiddleware } = require('./utils')

class Router {

  constructor({ prefix = '', notFoundHandler = defaultNotFoundHandler } = {}) {
    this[routerS] = new Impetuous()
    this[prefixS] = prefix
    this[tempRoutesS] = []
    this.setNotFoundHandler(notFoundHandler)
    //
    this.GET = (path, ...handlers) => this.get(path, ...handlers)
    this.POST = (path, ...handlers) => this.post(path, ...handlers)
    this.PUT = (path, ...handlers) => this.put(path, ...handlers)
    this.PATCH = (path, ...handlers) => this.patch(path, ...handlers)
    this.HEAD = (path, ...handlers) => this.head(path, ...handlers)
    this.OPTIONS = (path, ...handlers) => this.options(path, ...handlers)
    this.DELETE = (path, ...handlers) => this.delete(path, ...handlers)
    //
    this.MERGE = (...routers) => this.merge(...routers)
    this.NOT_FOUND = handler => this.setNotFoundHandler(handler)
  }

  get(path, ...handlers) {
    return this[addS]('GET', path, handlers)
  }

  post(path, ...handlers) {
    return this[addS]('POST', path, handlers)
  }

  put(path, ...handlers) {
    return this[addS]('PUT', path, handlers)
  }

  patch(path, ...handlers) {
    return this[addS]('PATCH', path, handlers)
  }

  head(path, ...handlers) {
    return this[addS]('HEAD', path, handlers)
  }

  options(path, ...handlers) {
    return this[addS]('OPTIONS', path, handlers)
  }

  delete(path, ...handlers) {
    return this[addS]('DELETE', path, handlers)
  }

  merge(...routers) {
    for (const router of routers) {
      for (const [method, path, handlers] of router[tempRoutesS]) {
        this[addS](method, path, handlers)
      }
    }
    return this
  }

  setNotFoundHandler(handler) {
    this[notFoundHandlerS] = wrapMiddleware(handler)
    return this
  }

  [addS](method, path, handlers) {
    const pathWithPrefix = this[prefixS] + path
    const handler = handlers.map(wrapMiddleware)
    this[tempRoutesS].push([method, pathWithPrefix, handler])
    this[routerS].add(method, pathWithPrefix, handler)
    return this
  }

  [executeS](ctx) {
    const { method, url } = ctx.request
    const route = this[routerS].find(method, url)
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

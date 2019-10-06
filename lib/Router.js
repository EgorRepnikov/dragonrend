const Impetuous = require('impetuous')

const routerS = Symbol('router')
const prefixS = Symbol('prefix')
const tempRoutesS = Symbol('tempRoutes')
const notFoundHandlerS = Symbol('notFoundHandler')
const addS = Symbol('add')

module.exports = class Router {

  constructor({ prefix = '' } = {}) {
    this[routerS] = new Impetuous()
    this[prefixS] = prefix
    this[tempRoutesS] = []
    this[notFoundHandlerS] = defaultNotFoundHandler
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

  [addS](method, path, handler) {
    const pathWithPrefix = this[prefixS] + path
    this[tempRoutesS].push({ method, path: pathWithPrefix, handler })
    this[routerS].add(method, pathWithPrefix, handler)
    return this
  }

  execute(ctx) {
    const { method, originalUrl } = ctx.request
    const route = this[routerS].find(method, originalUrl)
    if (route === null) {
      return this[notFoundHandlerS](ctx)
    }
    const { params, query, handler } = route
    ctx.params = params
    ctx.query = query
    return handler
  }

  merge(...routers) {
    for (const router of routers) {
      for (const { method, path, handler } of router[tempRoutesS]) {
        this[addS](method, path, handler)
      }
    }
    return this
  }

  setNotFoundHandler(fn) {
    this[notFoundHandlerS] = fn
    return this
  }
}

function defaultNotFoundHandler(ctx) {
  ctx.response.status(404).text('Not Found')
}

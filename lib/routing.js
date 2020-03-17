const Impetuous = require('impetuous')

class Router {

  constructor({ prefix = '', notFoundHandler = defaultNotFoundHandler } = {}) {
    this._router = new Impetuous()
    this._prefix = prefix
    this._tempRoutes = []
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
    return this._add('GET', path, handlers)
  }

  post(path, ...handlers) {
    return this._add('POST', path, handlers)
  }

  put(path, ...handlers) {
    return this._add('PUT', path, handlers)
  }

  patch(path, ...handlers) {
    return this._add('PATCH', path, handlers)
  }

  head(path, ...handlers) {
    return this._add('HEAD', path, handlers)
  }

  options(path, ...handlers) {
    return this._add('OPTIONS', path, handlers)
  }

  delete(path, ...handlers) {
    return this._add('DELETE', path, handlers)
  }

  merge(...routers) {
    for (const router of routers) {
      for (const [method, path, handlers] of router._tempRoutes) {
        this._add(method, path, handlers)
      }
    }
    return this
  }

  setNotFoundHandler(handler) {
    this._notFoundHandler = handler
    return this
  }

  _add(method, path, handlers) {
    const pathWithPrefix = this._prefix + path
    this._tempRoutes.push([method, pathWithPrefix, handlers])
    this._router.add(method, pathWithPrefix, handlers)
    return this
  }

  _find(ctx) {
    const { method, path } = ctx.request
    const route = this._router.find(method, path)
    if (route === null) {
      return [this._notFoundHandler]
    }
    const { params, value } = route
    ctx.request.params = params
    return value
  }
}

function defaultNotFoundHandler(ctx) {
  ctx.response.status(404).text('Not Found')
}

exports.Router = Router

exports.routing = ({ prefix, notFoundHandler } = {}) =>
  new Router({ prefix, notFoundHandler })

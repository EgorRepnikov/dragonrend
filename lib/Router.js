const Impetuous = require('impetuous')
const reducer = require('./reducer')

module.exports = class Router extends Impetuous {

  constructor({ prefix = '' } = {}) {
    super()
    this.prefix = prefix
    this.tempRoutes = []
    this.notFoundHandler = defaultNotFoundHandler
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

  _add(method, path, handler) {
    const pathWithPrefix = this.prefix + path
    this.tempRoutes.push({ method, path: pathWithPrefix, handler })
    return super.add(method, pathWithPrefix, handler)
  }

  execute(ctx) {
    const { method, url } = ctx.req
    const route = super.find(method, url)
    if (route === null) {
      return this.notFoundHandler(ctx)
    }
    const { params, query, handler } = route
    ctx.params = params
    ctx.query = query
    return reducer(handler, ctx)
  }

  merge(...routers) {
    for (const router of routers) {
      for (const { method, path, handler } of router.tempRoutes) {
        this._add(method, path, handler)
      }
    }
    return this
  }

  setNotFoundHandler(fn) {
    this.notFoundHandler = fn
  }
}

function defaultNotFoundHandler({ res }) {
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
  return Promise.resolve()
}

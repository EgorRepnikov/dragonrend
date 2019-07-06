const Impetuous = require('impetuous')

module.exports = class Router extends Impetuous {

  constructor({ prefix = '' } = {}) {
    super()
    this.prefix = prefix
    this.tempRoutes = []
  }

  get(path, handler) {
    return this._add('GET', path, handler)
  }

  post(path, handler) {
    return this._add('POST', path, handler)
  }

  put(path, handler) {
    return this._add('PUT', path, handler)
  }

  patch(path, handler) {
    return this._add('PATCH', path, handler)
  }

  head(path, handler) {
    return this._add('HEAD', path, handler)
  }

  options(path, handler) {
    return this._add('OPTIONS', path, handler)
  }

  delete(path, handler) {
    return this._add('DELETE', path, handler)
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
      const { res } = ctx
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(`{"error":"Not Found"}`)
      return Promise.resolve()
    }
    const { params, query, handler } = route
    ctx.params = params
    ctx.query = query
    return handler(ctx)
  }

  merge(...routers) {
    for (const router of routers) {
      for (const { method, path, handler } of router.tempRoutes) {
        this.tempRoutes.push({ method, path, handler })
        super.add(method, path, handler)
      }
    }
  }
}

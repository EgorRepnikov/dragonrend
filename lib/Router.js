const BaseRouter = require('./BaseRouter')

module.exports = class Router extends BaseRouter {

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

  execute(data) {
    const { method, url } = data.req
    const route = super.find(method, url)
    if (route === null) {
      return this._sendError(data, 404, 'Not Found')
    }
    const { params, query, handler } = route
    data.params = params
    data.query = query
    return handler(data)
  }

  _sendError({ res }, status, message) {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(`{"error":"${message}"}`)
    return Promise.resolve()
  }

  merge(...routers) {
    for (const router of routers) {
      for (const { method, path, handler } of router.tempRoutes) {
        super.add(method, path, handler)
      }
    }
  }
}

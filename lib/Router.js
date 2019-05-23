const PREFIX_REGEX = /\/$/
const PATH_REGEX = /\/[^?#]*|/

module.exports = class Router {

  constructor({ prefix = '' } = {}) {
    this.prefix = prefix.replace(PREFIX_REGEX, '')
    this.routes = new Map()

    this.get = this.routerHandler('GET').bind(this)
    this.put = this.routerHandler('PUT').bind(this)
    this.post = this.routerHandler('POST').bind(this)
    this.head = this.routerHandler('HEAD').bind(this)
    this.patch = this.routerHandler('PATCH').bind(this)
    this.delete = this.routerHandler('DELETE').bind(this)
    this.options = this.routerHandler('OPTIONS').bind(this)
  }

  routerHandler(method) {
    return (path, handler) => {
      const route = this.prefix + path.replace(PREFIX_REGEX, '')
      if (!this.routes.has(route)) {
        this.routes.set(route, new Map())
      }
      this.routes.get(route).set(method, handler)
    }
  }

  merge(...routers) {
    routers.forEach((router) => {
      router.routes.forEach((methodHandler, path) => {
        methodHandler.forEach((handler, method) => {
          this[method.toLowerCase()](path, handler)
        })
      })
    })
  }

  execute(data) {
    const path = PATH_REGEX.exec(data.req.url)[0]
    if (!this.routes.has(path)) {
      return this.sendError(data, 404, 'Not Found')
    }
    const pack = this.routes.get(path)
    const method = data.req.method
    if (!pack.has(method)) {
      return this.sendError(data, 405, 'Method Not Supported')
    }
    return pack.get(method)(data)
  }

  sendError({ res }, status, message) {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(`{"error":"${message}"}`)
    return Promise.resolve()
  }
}

const url = require('url')

const METHODS = [
  'HEAD',
  'OPTIONS',
  'GET',
  'PUT',
  'PATCH',
  'POST',
  'DELETE'
]

const PATH_REGEX = /^\/+|\/+$/g

class Router {

  constructor({ prefix = '' } = {}) {
    this.prefix = prefix
    this.routes = new Map()
  }

  preparePrefix() {
    let result = this.prefix.replace(PATH_REGEX, '')
    if (result.length > 0) {
      result += '/'
    }
    return result
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
    const path = this.extractPath(data)
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

  extractPath({ req }) {
    return url.parse(req.url, true).pathname.replace(PATH_REGEX, '')
  }

  sendError({ res }, status, message) {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(`{"error":"${message}"}`)
    return Promise.resolve()
  }
}

for (const method of METHODS) {
  Router.prototype[method.toLowerCase()] = function(path, handler) {
    const validPrefix = this.preparePrefix()
    const validPath = path.replace(PATH_REGEX, '')
    const route = validPrefix + validPath
    if (!this.routes.has(route)) {
      this.routes.set(route, new Map())
    }
    this.routes.get(route).set(method, handler)
  }
}

module.exports = Router

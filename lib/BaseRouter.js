const parse = require('regexparam')
const decodeUri = require('fast-decode-uri-component')
const urlParser = require('fast-url-parser')
const qs = require('querystringparser')
const RegexMap = require('regular-expression-map')

module.exports = class BaseRouter {

  constructor() {
    this.routes = new RegexMap()
  }

  add(method, path, handler) {
    const { keys, pattern } = parse(method + path)
    this.routes.put(
      new RegExp('^' + pattern.source.slice(3, pattern.source.length)),
      { keys, handler }
    )
		return this
  }

  merge(...routers) {
    this.routes.merge(...routers.map((router) => router.routes))
  }

  find(method, path) {
    const { pathname, query } = urlParser.parse(decodeUri(path))
    const route = this.routes.get(method + pathname)
    if (route === undefined) {
      return null
    }
    const { matches, value } = route
    const { keys, handler } = value
    const params = {}
    if (matches !== null) {
      for (let j = 0; j < keys.length;) {
        params[keys[j]] = matches[++j]
      }
    }
    return {
      params,
      query: qs.parse(query),
      handler
    }
  }
}

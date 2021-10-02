const decodeUri = require('fast-decode-uri-component')
const urlParser = require('fast-url-parser')
const qs = require('querystringparser')

const contentTypeParsers = {
  'application/json': body => JSON.parse(body)
}

module.exports.RequestFactory = class {

  constructor() {
    this._contentTypeParsers = contentTypeParsers
  }

  addContentTypeParser(contentType, fn) {
    this._contentTypeParsers[contentType] = fn
  }

  createRequest(req) {
    const contentTypeParsers = this._contentTypeParsers
    const { pathname, query } = urlParser.parse(decodeUri(req.url))
    return {
      headers: req.headers,
      url: req.url,
      method: req.method,
      raw: req,
      path: pathname,
      _query: false,
      query() {
        if (this._query === false) {
          this._query = qs.parse(query)
        }
        return this._query
      },
      _body: false,
      body() {
        if (this._body === false) {
          const contentLength = req.headers['content-length']
          if (contentLength === undefined || contentLength === '0') {
            this._body = ''
          } else {
            return new Promise(resolve => {
              let buffer = ''
              req.on('data', chunk => buffer += chunk)
              req.on('end', () => {
                const contentTypeParser = contentTypeParsers[req.headers['content-type']]
                this._body = contentTypeParser === undefined ? buffer : contentTypeParser(buffer)
                resolve(this._body)
              })
            })
          }
        }
        return Promise.resolve(this._body)
      }
    }
  }
}

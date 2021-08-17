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
    return new Promise(resolve => {
      const { pathname, query } = urlParser.parse(decodeUri(req.url))
      const request = {
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
      }
      const contentLength = req.headers['content-length']
      if (contentLength === undefined || contentLength === '0') {
        resolve(request)
      } else {
        let buffer = ''
        req.on('data', chunk => buffer += chunk)
        req.on('end', () => {
          const contentTypeParser = this._contentTypeParsers[req.headers['content-type']]
          request.body = contentTypeParser === undefined ? buffer : contentTypeParser(buffer)
          resolve(request)
        })
      }
    })
  }
}

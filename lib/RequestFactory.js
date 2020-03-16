const contentTypeParsers = {
  'application/json': body => JSON.parse(body)
}

module.exports = class RequestFactory {

  constructor() {
    this._contentTypeParsers = contentTypeParsers
  }

  addContentTypeParser(contentType, fn) {
    this._contentTypeParsers[contentType] = fn
  }

  createRequest(req) {
    return new Promise(resolve => {
      const request = {
        headers: req.headers,
        url: req.url,
        method: req.method,
        raw: req
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

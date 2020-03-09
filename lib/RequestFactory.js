const { contentTypeParsersS, reqS } = require('./symbols')

const contentTypeParsers = {
  'application/json': body => JSON.parse(body)
}

module.exports = class RequestFactory {

  constructor() {
    this[contentTypeParsersS] = contentTypeParsers
  }

  addContentTypeParser(contentType, fn) {
    this[contentTypeParsersS][contentType] = fn
  }

  createRequest(req) {
    return new Promise(resolve => {
      const request = {
        headers: req.headers,
        url: req.url,
        method: req.method,
        [reqS]: req
      }
      const contentLength = req.headers['content-length']
      if (contentLength === undefined || contentLength === '0') {
        resolve(request)
      } else {
        let buffer = ''
        req.on('data', chunk => buffer += chunk)
        req.on('end', () => {
          const contentTypeParser = this[contentTypeParsersS][req.headers['content-type']]
          request.body = contentTypeParser === undefined ? buffer : contentTypeParser(buffer)
          resolve(request)
        })
      }
    })
  }
}

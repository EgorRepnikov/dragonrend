module.exports = {
  // Dragonrend
  baseContextS: Symbol('baseContext'),
  handlersS: Symbol('handlers'),
  errorHandlerS: Symbol('errorHandler'),
  requestFactoryS: Symbol('requestFactory'),
  createListenerS: Symbol('createListener'),
  serverS: Symbol('server'),
  // RequestFactory
  contentTypeParsersS: Symbol('contentTypeParsers'),
  // Response
  resS: Symbol('res'),
  statusCodeS: Symbol('statusCode'),
  headersS: Symbol('headers'),
  isSentS: Symbol('isSent'),
  sendS: Symbol('send'),
  // Router
  routerS: Symbol('router'),
  prefixS: Symbol('prefix'),
  tempRoutesS: Symbol('tempRoutes'),
  notFoundHandlerS: Symbol('notFoundHandler'),
  addS: Symbol('add')
}

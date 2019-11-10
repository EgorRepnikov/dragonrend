[![Build Status](https://travis-ci.org/EgorRepnikov/dragonrend.svg?branch=master)](https://travis-ci.org/EgorRepnikov/dragonrend)
[![version](https://badgen.net/npm/v/dragonrend)](https://badgen.net/npm/v/dragonrend)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/EgorRepnikov/dragonrend/blob/master/LICENSE)

# Dragonrend
Dragonrend is simple, fast and lightweight Node.js framework for building web applications.

All these advantages are achieved due to the fact that there is nothing superfluous. You have only what it is needed for creating Backend apps - no more no less. And then you get a speed comparable to bare Node.

# Installation
```bash
$ npm install dragonrend
```

# Usage

```js
const { Dragonrend } = require('dragonrend')

const app = new Dragonrend()

app.get('/', (ctx) => {
  ctx.response.json({ message: 'Hi There' })
})

app.start(8080).then(() => console.log('Server has been started'))
// or cluster
app.start({ port: 8080, cluster: true })
```

# API

## Context
All middleware functions and handlers get the `context` object.
Context contains the `request` and `response` objects by default.

## Dragonrend
`Dragonrend` **inherits** `Router` (`Router` is a wrapper over [Impetuous](https://github.com/EgorRepnikov/impetuous)).

### context(key, value)
`key: String`

`value: Any`

Stores the values you can get from `ctx`.

```js
// add value
dragonrend.context('someValue', 'mock')

dragonrend.get('/path', (ctx) => {
  const { someValue } = ctx // <- and use it
})
```

### addContentTypeParser(contentType, fn)
`contentType: String`

`fn: Function` - `fn` gets request's body

Method add parser of requests body by content type.

```js
dragonrend.addContentTypeParser('text/plain', (body) => {
  return body.toUpperCase()
})
```

> **Feature:** Parsers will be added automatically to application, if you put them in the `parsers` directory at the root of the project. Files should export an object like that:

```js
module.exports = {
  contentType: 'text/plain',
  parse(body) {
    // do something
    return body
  }
}
```

### middleware(...fns)
`fns: Function|Array<Function>`

Adds handler which will called before Router's handler.

```js
// async/await or return promise
dragonrend.middleware(async (ctx) => {
  // do something
})
```

> **Feature:** Middleware-functions will be added automatically to application, if you put them in the `middleware` directory at the root of the project. Files should export a function by default.

```js
module.exports = ctx => {
  // do something
}
```

### setErrorHandler(fn)
`fn: Function`

`fn` should have `(error, ctx)` signature. `error` is an error occurred, `ctx` is context.

Sets error handler.
By default Dragonrend returns status 500 and body `{"error":"Internal Server Error"}`.

```js
dragonrend.setErrorHandler((error, ctx) => {
  ctx.response.status(500).json({ error: error.message })
})
```

### start(portOrOptions)

`portOrOptions: Number|Object`

Method gets port number or options object like [Net server.listen()](https://nodejs.org/api/net.html#net_server_listen_options_callback). Method returns `Promise`.

```js
dragonrend.start(8080).then(() => console.log('Started'))
// or
dragonrend.start({
  host: 'localhost',
  port: 80,
  exclusive: true
}).then(() => console.log('Started'))
```

If you need to start a cluster, then `options` object should contain field `cluster: true`. Also you may set specific count of workers `workersCount: 2` (default value is `os.cpus().length`).

```js
dragonrend.start({
  port: 80,
  cluster: true
}).then(() => console.log('Cluster is starting'))
```

### stop()
Method stops server and returns `Promise`.

```js
dragonrend.stop().then(() => console.log('Stopped'))
```

## Router
`Router` is a wrapper over [Impetuous](https://github.com/EgorRepnikov/impetuous).

### constructor
Gets the object with a prefix (not required), which appends to all routes of that instance of Router.

```js
const router = new Router({ prefix: '/api' })
```

### GET PUT PATCH POST DELETE HEAD OPTIONS (path, fn)
`path: String`

`fn: Function` - `fn` gets `ctx`

These methods add request handlers.

```js
const { Router } = require('dragonrend')

const router = new Router()

router.get('/path/:param', async (ctx) => {})

router.post('/path', ({ request, response }) => {})
```

### merge(...routers)
`routers: Router|Array<Router>`

Combines one or more instances of Router.

```js
const router1 = new Router({ prefix: '/base' })
const router2 = new Router()
const router3 = new Router({ prefix: '/api' })

router1.merge(router2, router3)
```

### setNotFoundHandler(fn)
`fn: Function`

Adds handler in case a route will not found.

```js
const router = new Router()

router.setNotFoundHandler((ctx) => {
  ctx.response.status(404).text('Not Found')
})
```

### Instance of Router should be added to Dragonrend
`Dragonrend` inherits `Router`, therefore it has method `merge`.

```js
const dragonrend = new Dragonrend()
const router = new Router()
// add some handlers to router
dragonrend.merge(router)
// start server...
```

> **Feature:** Instances of Router are added automatically to application, if you add them to the `routes` directory at the root of project. Router file should export `Router` object.

## Routify Function
`routify` function creates a router very easily and productively. This is the recommended way to declare a router.

```js
const { routify, GET, POST } = require('dragonrend')

const router = routify()([
  [GET, '/path', (ctx) => ctx.response.text('OK')],
  [POST, '/path',
    ctx => {
      // Handle something
    },
    ctx => ctx.response.text('OK')]
])
```

Example with options:

```js
const { routify, GET } = require('dragonrend')

const router = routify({
  prefix: '/api',
  notFoundHandler(ctx) {
    ctx.response.status(404).text('Not Found')
  }
})([
  // Declare your routes here
])
```

## Request
Request objects is added to `context` by default.

### headers
`headers` is object, which contains all headers of request.

```js
dragonrend.get((ctx) => {
  const { headers } = ctx.request
  console.log(headers['content-length'])
})
```

### originalUrl
`originalUrl` is url from request without changes.

```js
dragonrend.middleware((ctx) => {
  const { originalUrl } = ctx.request
  console.log(originalUrl)
})
```

### method
`method` is request's method.

```js
dragonrend.middleware((ctx) => {
  const { method } = ctx.request
  console.log(method)
})
```

### body
`body` is parsed request's body.

```js
dragonrend.middleware((ctx) => {
  const { body } = ctx.request
  console.log(body)
})
```

### rawBody
`rawBody` is no parsed request's body.

```js
dragonrend.middleware((ctx) => {
  const { rawBody } = ctx.request
  console.log(rawBody)
})
```

## Response
Response objects is added to `context` by default.

### header(key, value)
`key: String`

`value: String`

Adds header key-value pair to Response.

```js
dragonrend.middleware((ctx) => {
  ctx.response.header('x-total-count', '0').text('')
})
```

### status(statusCode)
`statusCode: Number`

Sets custom status code to Response. Default value is `200`.

```js
dragonrend.middleware((ctx) => {
  ctx.response.status(201).text('OK')
})
```

### json(data)
`data: Object`

Sends request with `application/json` body.

```js
dragonrend.middleware((ctx) => {
  ctx.response.json({ message: 'Hi There' })
})
```

### text(data)
`data: String`

Sends request with `text/plain` body.

```js
dragonrend.middleware((ctx) => {
  ctx.response.text('Hi There')
})
```

### html(data)
`data: String`

Sends request with `text/html` body.

```js
dragonrend.middleware((ctx) => {
  ctx.response.html('<p>Hi There</p>')
})
```

### send(data, contentType)
`data: String|Buffer`

`contentType: String`

Sends request with custom body.

```js
dragonrend.middleware((ctx) => {
  ctx.response.send(imageBuffer, 'image/jpeg')
})
```

## Auto Including
Dragonrend supports auto including of Middleware-functions, Routers and Content Type Parsers. You should follow some rules for this functionality to work.

- Files must be in specific directories at the root of project.
  - Middleware-functions in `middleware` directory.
  - Routers Instances in `routes` directory.
  - Content Type Parsers in `parsers` directory.
- The root directory is the directory that contains the file that is launched very first, i.e. directory of the Node.js process. If you start project with npm script (like `npm run start`) and all JS files are in `src` directory and main file is `src/index.js`, then root is `../src` and Auto Including will not work. In this case, it can be customized.

```js
// There are default values
const app = new Dragonrend({
  autoIncludeRoutes: true,
  routesDir: 'routes',
  autoIncludeMiddleware: true,
  middlewareDir: 'middleware',
  autoIncludeContentTypeParsers: true,
  contentTypeParsersDir: 'parsers'
})
```

# Author
**Egor Repnikov** - [GitHub](https://github.com/EgorRepnikov)

# License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[![Build Status](https://travis-ci.org/EgorRepnikov/dragonrend.svg?branch=master)](https://travis-ci.org/EgorRepnikov/dragonrend)
[![version](https://badgen.net/npm/v/dragonrend)](https://www.npmjs.com/package/dragonrend)
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
const { dragonrend } = require('dragonrend')

const app = dragonrend()

app.get('/', ctx => ctx.response.json({ message: 'Hi There' }))

app.start(8080).then(() => console.log('Server has been started'))
```

```js
const { dragonrend } = require('dragonrend')

const { GET, START } = dragonrend()

GET('/', ctx => ctx.response.json({ message: 'Hi There' }))

START(8080, () => console.log('Server has been started'))
```

# API

## Context
All middleware functions and handlers get the `context` object.
Context contains the `request` and `response` objects by default.

## dragonrend(options)
This is builder function, which returns Dragonrend instance.

```js
const { dragonrend } = require('dragonrend')

const app = dragonrend({
  server: false, // your server instance, default: false
  https: false, // object with `key` and `cert` like `https.createServer`, default: false
  http2: false, // true or false, default: false
  errorHandler(e, ctx) { // this is default error handler
    console.log(e)
    ctx.response.status(500).text('Internal Server Error')
  },
  routing: { // default: {}
    prefix: '/api', // default: ''
    notFoundHandler(ctx) { // this is default not found handler
      ctx.response.status(404).text('Not Found')
    }
  },
  autoIncluding: { // default: false
    rootDir: 'dir', // default: process.cwd() (Node.js process directory)
    autoIncludeRoutes: true, // this is default value
    routesDir: 'routes', // this is default value
    autoIncludeMiddleware: true, // this is default value
    middlewareDir: 'middleware', // this is default value
    autoIncludeContentTypeParsers: true, // this is default value
    contentTypeParsersDir: 'parsers' // this is default value
  }
})
```

## Dragonrend Instance
`Dragonrend` **inherits** `Router`.

### context(object: Object)
Stores the values you can get from `ctx`.

```js
// add value
app.context({
  someValue: 'mock'
})

app.get('/path', ctx => {
  const { someValue } = ctx // <- and use it
})
```

```js
const { CONTEXT, GET } = app

CONTEXT({
  someValue: 'mock'
})

GET('/path', ctx => {
  const { someValue } = ctx // <- and use it
})
```

### addContentTypeParser(contentType: String, fn: Function)
Method add parser of requests body by content type.

```js
app.addContentTypeParser('text/plain', body => {
  return body.toUpperCase()
})
```

```js
const { PARSER } = app

PARSER('text/plain', body => body.toUpperCase())
```

> **Feature:** Parsers can be added to the application automatically. Read more in the section "Auto Including".

### middleware(...fns: Function)
Adds handler which will called before Router's handler.

```js
// async/await or return promise
app.middleware(async ctx => {
  // do something
})

app.middleware(
  ctx => {},
  ctx => {}
)
```

```js
const { MIDDLEWARE } = app

MIDDLEWARE(async ctx => {
  // do something
})

MIDDLEWARE(
  ctx => {},
  ctx => {}
)
```

> **Feature:** Middleware-functions can be added to the application automatically. Read more in the section "Auto Including".

### setErrorHandler(fn: Function)
`fn` should have `(error, ctx)` signature. `error` is an error occurred, `ctx` is context.

Sets error handler.
By default Dragonrend returns status 500 and body `{"error":"Internal Server Error"}`.

```js
app.setErrorHandler((error, ctx) => {
  ctx.response.status(500).json({ error: error.message })
})
```

```js
const { CATCH_ERROR } = app

CATCH_ERROR((error, ctx) => {
  ctx.response.status(500).json({ error: error.message })
})
```

### start(portOrOptions: Number|Object)
Method gets port number or options object like [Net server.listen()](https://nodejs.org/api/net.html#net_server_listen_options_callback). Method returns `Promise`, also it is possible to use callback.

```js
app.start(8080).then(() => console.log('Started'))
// or
app.start({
  host: 'localhost',
  port: 80,
  exclusive: true
}).then(() => console.log('Started'))
```

```js
const { START } = app

START(8080, () => console.log('Started'))
```

### stop()
Method stops server and returns `Promise`, also it is possible to use callback.

```js
dragonrend.stop().then(() => console.log('Stopped'))
```

```js
const { STOP } = app

STOP(() => console.log('Stopped'))
```

## Routing
Routing is performed using [Impetuous](https://github.com/EgorRepnikov/impetuous).

### routing function
Gets the object with a `prefix` and `not found handler`, which appends to all routes of that instance of Router.

Returns prepared `Router` instance (`Router` is a wrapper over [Impetuous](https://github.com/EgorRepnikov/impetuous)).

```js
const router = routing({
  prefix: '/api',
  notFoundHandler() {
    ctx.response.status(404).text('Not Found')
  }
})
```

### Classical Express-like routing
Router instance has `get, put, patch, post, delete, head, options (path: String, fn: Function)` methods.

```js
const { routing } = require('dragonrend')

const router = routing()

router.get('/path/:param', async ctx => {})

router.post('/path', ({ request, response }) => {})

module.exports = router
```

### GET PUT PATCH POST DELETE HEAD OPTIONS (path: String, fn: Function)
These methods add request handlers.

For example, a file with routes may look like this:

```js
const { routing } = require('dragonrend')

const { GET, POST } = module.exports = routing()

GET('/path/:param', async (ctx) => {})

POST('/path', ({ request, response }) => {})
```

### merge(...routers: Router)
Combines one or more instances of Router.

```js
const router1 = routing({ prefix: '/base' })
const router2 = routing()
const router3 = routing({ prefix: '/api' })

router1.merge(router2, router3)
```

```js
const router1 = routing({ prefix: '/base' })
const router2 = routing()
const router3 = routing({ prefix: '/api' })

const { MERGE } = router1

MERGE(router2, router3)
```

### Instance of Router should be added to Dragonrend
`Dragonrend` inherits `Router`, therefore it has method `merge`.

```js
const app = dragonrend()
const router = routing()
// add some handlers to router
app.merge(router)
// start server...
```

```js
const { MERGE } = dragonrend()
const router = routing()

MERGE(router)
```

> **Feature:** Routers can be added to the application automatically. Read more in the section "Auto Including".

## Request
Request objects is added to `context` by default.

Fields of Request instance:

| Field | Description |
|---|---|
| headers | object, which contains all headers of request |
| url | url from request |
| method | request's method |
| body | parsed request's body |
| rawBody | no parsed request's body |

```js
app.middleware(ctx => {
  const { headers, url, method, body, rawBody } = ctx
}
```

## Response
Response objects is added to `context` by default.

| Method | Description |
|---|---|
| header(key: String, value: String) | Adds header key-value pair to Response |
| status(statusCode: Number) | Sets custom status code to Response, default value is `200` |
| json(data: Object) | Sends request with `application/json` body |
| text(data: String) | Sends request with `text/plain` body |
| html(data: String) | Sends request with `text/html` body |
| send(data: String|Buffer, contentType: String) | Sends request with custom body |

```js
app.middleware({ response } => {
  response
    .header('x-total-count', '0')
    .status(201)
    //
    .json({ message: 'Hi There' })
    // or
    .text('Hi There')
    // or
    .html('<p>Hi There</p>')
    // or
    .send(imageBuffer, 'image/jpeg')
})
```

## Return Response
In any function, whether it is Middleware or NotFound-handler, you can return an object with a response.

```js
app.middleware(async ctx => {
  return {
    status: 201 // default: 200,
    headers: { 'content-type': 'text/plain' } // default: {},
    body: 'body' // default: ''
  }
})
```

There is helper functions:

```js
const { dragonrend, json, html, text } = require('dragonrend')

const { GET } = dragonrend()

GET(ctx => json({
  body: { message: 'Hi There' }
}))

GET(ctx => html({
  body: '<p>Hi There</p>'
}))

GET(ctx => text({
  body: 'Hi There'
}))
```

## Auto Including
Dragonrend supports auto including of Middleware-functions, Routers and Content Type Parsers. You should follow some rules for this functionality to work.

This feature is disabled by default. You can enable it:

```js
const app = dragonrend({
  autoIncluding: true
})
// or with options
const app = dragonrend({
  autoIncluding: {
    // options
  }
})
```

- Files must be in specific directories at the root of project.
  - Middleware-functions in `middleware` directory.
  - Routers Instances in `routes` directory.
  - Content Type Parsers in `parsers` directory.
- The root directory is the directory that contains the file that is launched very first, i.e. directory of the Node.js process. If you start project with npm script (like `npm run start`) and all JS files are in `src` directory and main file is `src/index.js`, then root is `../src` and Auto Including will not work. In this case, it can be customized.

```js
// There are default values of options
const app = dragonrend({
  autoIncludeRoutes: true,
  routesDir: 'routes',
  autoIncludeMiddleware: true,
  middlewareDir: 'middleware',
  autoIncludeContentTypeParsers: true,
  contentTypeParsersDir: 'parsers',
  rootDir: process.cwd()
})
```

If you use `src` directory for example as root of application, then you should set that args:

```js
const app = dragonrend({
  rootDir: __dirname
})
```

### Parsers
Files should export an object like that:

```js
module.exports = {
  contentType: 'text/plain',
  parse(body) {
    // do something
    return body
  }
}
```

### Middleware
Files should export a function by default.

```js
module.exports = ctx => {
  // do something
}
```

### Router
Router file should export `Router` object.

```js
const router = routing()

module.exports = router
```

```js
const { GET } = module.exports = routing()
```

# Example
You can find an example of using the framework by [link](https://github.com/EgorRepnikov/artaeum/tree/master/profile). This is a `Profile` microservice of a simple microservice social network [Artaeum](https://github.com/EgorRepnikov/artaeum).

# Author
**Egor Repnikov** - [GitHub](https://github.com/EgorRepnikov)

# License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

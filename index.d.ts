import { Router } from "./lib/routing"

type Middleware = (ctx: any, next?: () => Promise<any>) => any

type Object = { [key: any]: any }

interface RoutingOptions {
  prefix?: string,
  notFoundHandler?: (ctx: any) => any,
}

interface Dragonrend {

  MIDDLEWARE: (...fns: Middleware[]) => Dragonrend

  CONTEXT: (object: Object) => Dragonrend

  PARSER: (contentType: string, handler: (body: string) => any) => Dragonrend

  CATCH_ERROR: (handler: (error: any, ctx: any) => any) => Dragonrend

  START: (portOrOptions: number | Object, cb?: (err: any) => any) => void

  STOP: (cb?: () => any) => Promise<any> | void

  middleware(...fns: Middleware[]): Dragonrend

  context(object: Object): Dragonrend

  addContentTypeParser(contentType: string, handler: (body: string) => any): Dragonrend

  setErrorHandler(handler: (error: any, ctx: any) => any): Dragonrend

  start(portOrOptions: number | Object, cb?: (err: any) => any): void

  stop(cb?: () => any): Promise<any> | void
}

interface Router {

  GET: (path: string, ...handlers: Middleware[]) => Router

  POST: (path: string, ...handlers: Middleware[]) => Router

  PUT: (path: string, ...handlers: Middleware[]) => Router

  PATCH: (path: string, ...handlers: Middleware[]) => Router

  HEAD: (path: string, ...handlers: Middleware[]) => Router

  OPTIONS: (path: string, ...handlers: Middleware[]) => Router

  DELETE: (path: string, ...handlers: Middleware[]) => Router

  MERGE: (...routers: Router[]) => Router

  NOT_FOUND: (handler: (ctx: any) => any) => Router

  get(path: string, ...handlers: Middleware[]): Router

  post(path: string, ...handlers: Middleware[]): Router

  put(path: string, ...handlers: Middleware[]): Router

  patch(path: string, ...handlers: Middleware[]): Router

  head(path: string, ...handlers: Middleware[]): Router

  options(path: string, ...handlers: Middleware[]): Router

  delete(path: string, ...handlers: Middleware[]): Router

  merge(...routers: Router[]): Router

  setNotFoundHandler(handler: (ctx: any) => any): Router
}

export function dragonrend(options?: {
  server?: boolean = false,
  https?: boolean = false,
  http2?: boolean = false,
  noDelay?: boolean = false,
  routing?: RoutingOptions = {},
  autoIncluding?: boolean = false,
  errorHandler?: (e: any, ctx: any) => any,
}): Dragonrend

export function routing(options?: RoutingOptions): Router

export function json(body: Object)
export function json(status: number, body: Object)
export function json(status: number, headers: Object, body: Object)

export function text(body: string)
export function text(status: number, body: string)
export function text(status: number, headers: Object, body: string)

export function html(body: string)
export function html(status: number, body: string)
export function html(status: number, headers: Object, body: string)

export function returnable(fn: Middleware)

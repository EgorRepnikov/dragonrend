function setReduce(set, cb, initial) {
  let result = initial
  set.forEach((value) => result = cb(result, value))
  return result
}

module.exports = (fns, ctx) => setReduce(fns, (previous, current) => {
  if (ctx.res.headersSent) {
    return Promise.resolve()
  } else {
    return previous.then(() => current(ctx))
  }
}, Promise.resolve())

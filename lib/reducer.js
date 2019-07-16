module.exports = (array, ctx) =>
  array.reduce((previous, current) =>
    previous.then(() => !ctx.res.headersSent && current(ctx)), Promise.resolve())

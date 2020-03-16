exports.reduce = (array, ctx) =>
  array.reduce((previous, current) =>
    previous.then(callNext => callNext !== false && current(ctx)), Promise.resolve())

const Router = require('../../../lib/Router')

const router = new Router()

router.get('/router2', (ctx) => ctx.response.text('router2'))

module.exports = router

const Router = require('../../../lib/Router')

const router = new Router()

router.get('/router1', (ctx) => ctx.response.text('router1'))

module.exports = router

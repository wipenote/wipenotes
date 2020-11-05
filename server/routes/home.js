const { Router } = require('express');
const { routes, links } = require('../config');
const axios = require('axios').default;

const router = Router();

router.use(routes.home, homeRouter);

module.exports = router

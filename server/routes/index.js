const { Router } = require('express');
const axios = require('axios').default;

const router = Router();

// router.use(routes.home, homeRouter);
router.get('*', async (req, res) => {
  return res.render('pages/home');
});

module.exports = router

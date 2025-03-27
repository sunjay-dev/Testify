const router = require('express').Router();
const testController = require('../controllers/test.controller');

// router.get('/gettest', testController.getMcqs);
router.get('/fetchtests', testController.fetchtests);
router.post('/createtest', testController.createtest);

module.exports = router;
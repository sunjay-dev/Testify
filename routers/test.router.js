const router = require('express').Router();
const testController = require('../controllers/test.controller');

router.get('/create-test', (req, res) => {
    res.render('create');
});

router.get('/getTest/:testId', testController.getTest);
router.get('/fetch-tests', testController.fetchAllTests);

router.post('/create-test', testController.createTest);
router.put('/updateTest/:testId', testController.updateTest);

module.exports = router;
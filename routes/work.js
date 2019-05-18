const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('work/index');
});


module.exports = router;
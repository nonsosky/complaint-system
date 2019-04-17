const router = require('express').Router();

router.get('/index', (req, res) => {
    res.render('aboutus/index');
}); 

module.exports = router;
const router = require('express').Router();


router.get('/mycomplaint', (req, res)=>{
    res.render('mycomplaints/mycomplaint');
});


module.exports = router;
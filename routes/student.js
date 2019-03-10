const router = require("express").Router();
const studentrepository = require('../server/repository/StudentRepos');
const complaintsRepository = require('../server/repository/ComplaintsRepos');
const passport = require("passport");
const bcrypt = require("bcryptjs");



//complaints route
router.post('/make/complaints', (req, res) =>{
    let year, month, day, nDate;
    nDate = new Date();

    year = nDate.getFullYear();
    month = nDate.getMonth() + 1;
    day = nDate.getDate();

    let newComplaint = {
        complaint: req.body.complaints,
        createdAt: year+'/'+month+'/'+day,
        student_id: req.user.id
    };

    console.log(newComplaint);

    complaintsRepository.insert(newComplaint)
      .then(complaint =>{
          req.flash('success', 'Complaint submitted successfully');
          res.redirect('/');
      },err=>{
          console.log(err);
          req.flash('error', 'Unable to make complaint');
          res.redirect('/');
      });
});


//Login student route 
router.post('/signin', (req, res, next) => {
    require("../server/config/passport")(passport, studentrepository);
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true,
        successFlash: true
    })(req, res, next);
});

//Signup student route
router.post('/register', (req, res) => {
    let newStudent = {
        lastName: req.body.lastname,
        firstName: req.body.firstname,
        middleName: req.body.middlename,
        gender: req.body.gender,
        emailAddress: req.body.email,
        password: req.body.password,
        dob: req.body.dob,
        matric_no: req.body.matric,
    }
    console.log(newStudent);
    studentrepository.findOne([{
        emailAddress: newStudent.emailAddress
    }])
        .then(student => {
            if (student !== false) {
                req.flash('error', 'Email already exist');
                res.redirect('/');
            }
            else {
                bcrypt.genSalt(12, (err, salt) => {
                    bcrypt.hash(newStudent.password, salt, (err, hash) => {
                        if (err) throw err;
                        newStudent.password = hash;
                        studentrepository.insert(newStudent)
                            .then(student => {
                                req.flash('success', 'successfully registered');
                                res.redirect('/');
                            }, err => {
                                console.log(err);
                                req.flash('error', 'Unable to register user');
                                res.redirect('/');
                            })
                    });
                });
            }
        });

});

module.exports = router;
const router = require("express").Router();
const studentrepository = require('../server/repository/StudentRepos');
const complaintsRepository = require('../server/repository/ComplaintsRepos');
const passport = require("passport");
const bcrypt = require("bcryptjs");

//Load department repos
const departmentRepository = require("../server/repository/DepartmentRepos");
const postRepository = require("../server/repository/PostRepos");

//-- local middlewares
const { ensureAuthenticated } = require('../server/config/auth');

//complaints route
router.post('/make/complaints', (req, res) => {
    let year, month, day, nDate;
    nDate = new Date();

    year = nDate.getFullYear();
    month = nDate.getMonth() + 1;
    day = nDate.getDate();

    let newComplaint = {
        complaint: req.body.complaints,
        createdAt: year + '/' + month + '/' + day,
        student_id: req.user.id
    };

    console.log(newComplaint);

    complaintsRepository.insert(newComplaint)
        .then(complaint => {
            req.flash('success', 'Complaint submitted successfully');
            res.redirect('/');
        }, err => {
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

router.get('/signup', (req, res) => {
    departmentRepository.findMany([])
        .then(departments => {
            console.log(departments);
            res.render('student/signup', {
                pageTitle: 'Student Complaint System',
                departments
            });
        }, err => {
            console.log(err);
        });
})

//Signup student route
router.post('/signup', (req, res) => {
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


router.get('/mycomplaint', ensureAuthenticated, (req, res) => {
    complaintsRepository.findById(2)
        .then(complaint => {
            postRepository.findMany([{ student_id: req.user.id }, 
                { complaint_id: complaint.id }], "=", "AND")
                .then(chat => {
                    if (chat) {
                        for(let item of chat){
                            if(item.user_type = 0){
                                item.by = "admin-reply"
                            } else{
                                item.by = "student-reply"
                            }
                        }
                        res.render('chat/mycomplaint', {
                            chat,
                            complaint,
                        });
                    } else {
                        res.render('chat/mycomplaint', {
                            chat: false,
                            complaint
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);
        })

});

router.post('/chat/', (req, res) => {
    let nDate = new Date();
    let createdAt = nDate.getFullYear() + '-' + nDate.getMonth() + '-' + nDate.getDate();
    let newPost = {
        createdAt,
        reply: req.body.reply,
        complaint_id: req.body.complaintId,
        student_id: req.user.id,
        user_type: 1
    }

    postRepository.insert(newPost)
        .then(post => {
            res.render("chat/mycomplaint", {
                chat: post,
                student: true
            });
        })
        .catch(err => {
            console.log(err);
        })
});

module.exports = router;
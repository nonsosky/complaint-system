const router = require("express").Router();
const studentrepository = require('../server/repository/StudentRepos');
const complaintsRepository = require('../server/repository/ComplaintsRepos');
const passport = require("passport");
const bcrypt = require("bcryptjs");

//Load send.js
const send = require("../third_party/send");

//Load department repos
const departmentRepository = require("../server/repository/DepartmentRepos");
const postRepository = require("../server/repository/PostRepos");

//-- local middlewares
const { ensureAuthenticated } = require('../server/config/auth');
const {formatChat, formatDate} = require('../server/helpers/formatter');

//complaints route
router.post('/make/complaints', (req, res) => {
    let newComplaint = {
        complaint: req.body.complaints,
        student_id: req.user.id
    };

    // console.log(newComplaint);

    complaintsRepository.insert(newComplaint)
        .then(complaint => {
            var number = req.user.phone_no;
            send({to: number, text: 'Your complaints have been received successfully'});
            req.flash('success', 'Complaint submitted successfully');
            res.redirect('/');
        }, err => {
            console.log(err);
            req.flash('error', 'Unable to make complaint');
            res.redirect('/');
        });
});

router.get('/signin', (req, res) => {
    res.render('student/signin');
});


 //View profile
 router.get('/index', (req, res) => {
     res.render('student/index');
});

//Password Reset
router.get('/reset', (req, res) => {
    res.render('student/reset');
});

//change password
router.get('/changepsw', (req, res) => {
    res.render('student/changepsw');
});

//Edit Profile
router.get('/editprofile', (req, res) => {
    res.render('student/editprofile');
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
        phone_no: "234"+req.body.phoneNo,
        matric_no: req.body.matric,
    }
    console.log(newStudent);
    studentrepository.findOne([{
        emailAddress: newStudent.emailAddress
    }])
        .then(student => {
            if (student !== false) {
                req.flash('error', 'Email already exist');
                res.redirect('/student/signup');
            }
            else {
                bcrypt.genSalt(12, (err, salt) => {
                    bcrypt.hash(newStudent.password, salt, (err, hash) => {
                        if (err) throw err;
                        newStudent.password = hash;
                        studentrepository.insert(newStudent)
                            .then(student => {
                                send({to: newStudent.phone_no, text:'Your registeration to Impoly Complaint system was successful, feel free to make your complaint'})
                                    .then(info => {
                                        console.log(info)
                                        req.flash('success', 'successfully registered');
                                        res.redirect('/student/signin');
                                    }).catch(err => {
                                        console.log(err);
                                        res.redirect('/student/signin');
                                    });

                            }, err => {
                                console.log(err);
                                req.flash('error', 'Unable to register user');
                                res.redirect('/student/signup');
                            })
                    });
                });
            }
        });

});


router.get('/mycomplaints', ensureAuthenticated, (req, res) => {
    let id = req.user.id;
    complaintsRepository.findMany([{ student_id: id }], "=")
        .then(complaints => {
            for(let item of complaints){
                item.createdAt = formatDate(item.createdAt);
            }
            res.render('mycomplaints/mycomplaint', { complaints });
        })
        .catch(err => {
            req.flash('error', 'Sorry, an error occured while retrieving data.');
            res.redirect('/');
        });
});

router.get('/chat/:id', (req, res) => {
    let complaintId = req.params.id;
    let studentId = req.user.id;

    complaintsRepository.findById(complaintId)
        .then(complaint => {
            postRepository.findJoin({student: [{column: 'lastName'}, {column:'firstName'}], post: [{column: 'createdAt'}, {column: 'reply'}, {column:'complaint_id'}, {column:'student_id'}, {column: 'user_type'}]}, {student: 'student_id'}, [{table: 'post', column: 'student_id', value: studentId, operator: '=', nextOperator: 'AND'}, {table: 'post', column: 'complaint_id', value: complaintId, operator: '='}])
                .then(chat => {
                    
                    if (chat){
                        chat = formatChat(chat);
                    }
                    console.log(chat);
                    complaint.createdAt = formatDate(complaint.createdAt);
                    res.render("chat/chats", {active:"student", complaint, chat, uid: studentId, uType: 1});
                })
                .catch(err => {
                    console.log(err);
                    req.flash('error', 'Failed to retrieve chats');
                    res.redirect('/');
                });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        });
});

router.post('/chat/', ensureAuthenticated, (req, res) => {
    
    //console.log(createdAt)
    let newPost = {
        reply: req.body.reply,
        complaint_id: req.body.complaintId,
        student_id: req.user.id,
        user_type: 1
    }

        postRepository.insert(newPost)
        .then(chat => {
            res.redirect(`/student/chat/${req.body.complaintId}`)
        })
        .catch(err => {
            console.log(err);
        });
      
});




module.exports = router;
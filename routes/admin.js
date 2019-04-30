//-- Module dependencies
const passport = require('passport');
const router = require('express').Router();


//-- Load App Repositories
const complaintRepository = require('../server/repository/ComplaintsRepos');
const postRepository = require("../server/repository/PostRepos");
const adminrepository = require('../server/repository/AdminRepos');
const studentRepository = require('../server/repository/StudentRepos');
const { formatChat } = require('../server/helpers/formatter');
const { ensureAuthenticated } = require('../server/config/auth');

// Load sendjs
const send = require("../third_party/send");

//-- display admin index page
router.get('/', ensureAuthenticated, (req, res) => {
    complaintRepository.findJoin({ student: [{ column: "lastName" }, { column: "firstName" }], complaints: [{ column: "complaint" }, { column: "status" }, { column: 'id' }] }, { student: "student_id" })
        .then(allComplaints => {
            res.render('admin/index', { admin: true, allComplaints, allComplaintBtn: "active" });
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Sorry an error occured.');
            res.redirect('/');
        });
})
//-- display the admin signin page
router.get('/signin/', (req, res) => {
    res.render('admin/signin', {
        pageTitle: 'Complaint System | Signin'
    });
});
//-- Process Admin signin
router.post('/signin/', (req, res, next) => {
    require("../server/config/passport")(passport, adminrepository);
    passport.authenticate('local', {
        successRedirect: '/admin/',
        failureRedirect: '/admin/signin/',
        failureFlash: true,
        successFlash: true
    })(req, res, next);
});

//-- Admin chat panel
router.get('/chat/:id', (req, res) => {
    let complaintId = req.params.id;
    //let adminId = req.user.id;

    complaintRepository.findById(complaintId)
        .then(complaint => {
            postRepository.findJoin({ student: [{ column: 'lastName' }, { column: 'firstName' }], post: [{ column: 'createdAt' }, { column: 'reply' }, { column: 'complaint_id' }, { column: 'student_id' }, { column: 'user_type' }] }, { student: 'student_id' }, [{ table: 'post', column: 'complaint_id', value: complaintId, operator: '=' }])
                .then(chat => {
                    if (chat) {
                        chat = formatChat(chat);
                    }
                    //console.log(chat);
                    res.render("chat/chats", { admin: true, active: "admin", complaint, chat, pageTitle:"Complaint System | Chatting", uType: 0 });
                })
                .catch(err => {
                    req.flash('error', 'Failed to retrieve chats');
                    res.redirect('/');
                });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        });
});


router.post('/chat/', (req, res) => {
    let newPost = {
        reply: req.body.reply,
        complaint_id: req.body.complaintId,
        student_id: req.body.studentId,
        admin_id: req.user.id,
        user_type: 0
    }

    postRepository.insert(newPost)
        .then(chat => {
            res.redirect(`/admin/chat/${req.body.complaintId}`)
        })
        .catch(err => {
            console.log(err);
        });

});

router.get('/todays/complaints/', ensureAuthenticated, (req, res) => {
    let today = new Date();
    let year, month, day;
    year = today.getFullYear();
    month = today.getMonth() + 1;
    day = today.getDate();
    today = year + "-" + month + "-" + day;
    complaintRepository.findJoin({ student: [{ column: "lastName" }, { column: "firstName" }], complaints: [{ column: "complaint" }, { column: "status" }, { column: 'id' }] }, { student: "student_id" }, [{table:'complaints', column: 'createdAt', value: today, operator: '>='}])
        .then(todaysComplaints => {
            res.render('admin/index', { admin: true, todaysComplaints, todayBtn: "active" });
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Sorry an error occured.');
            res.redirect('/');
        });
});

router.get('/complaint/resolve/:cid', (req, res)=>{
    let cid = req.params.cid;
    let host = req.hostname;
    let port = req.socket.localPort;
    let domainName = req.baseUrl;
    let protocol = req.protocol;
    let address = `${protocol}://${host}:${port}${domainName}/`;
    console.log(address)

    complaintRepository.update({status: 1}, cid)
      .then(result=>{
        let sid = result.student_id;
        studentRepository.findById(sid)
          .then(student=>{
            
              let to  = student.phone_no;
              send({to, text:'Your Complaint has been successfully resolved'})
                .then(info=>{
                    console.log(info)
                })
                .catch(err=>{
                    console.log(err)
                })
              req.flash('success', "Complaint has been resolved.");
              res.redirect(address);
          })
          .catch(err=>{
            console.log(err);
            req.flash('error', 'Sorry action can not be completed.');
            res.redirect('/admin/');
          });
      })
      .catch(err=>{
          console.log(err);
          res.redirect('/admin/');
      })

});

router.get('/view/chat/:id', ensureAuthenticated, (req, res) => {
    let complaintId = req.params.id;
    //let adminId = req.user.id;

    complaintRepository.findById(complaintId)
        .then(complaint => {
            postRepository.findJoin({ student: [{ column: 'lastName' }, { column: 'firstName' }], post: [{ column: 'createdAt' }, { column: 'reply' }, { column: 'complaint_id' }, { column: 'student_id' }, { column: 'user_type' }] }, { student: 'student_id' }, [{ table: 'post', column: 'complaint_id', value: complaintId, operator: '=' }])
                .then(chat => {
                    if (chat) {
                        chat = formatChat(chat);
                    }
                    //console.log(chat);
                    res.render("chat/view_chat", { admin: true, active: "admin", complaint, chat, pageTitle: "Complaint System | View Chats"});
                })
                .catch(err => {
                    req.flash('error', 'Failed to retrieve chats');
                    res.redirect('/');
                });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        });
});

module.exports = router;
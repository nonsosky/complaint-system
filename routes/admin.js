//-- Module dependencies
const passport = require('passport');
const router = require('express').Router();


//-- Load App Repositories
const complaintRepository = require('../server/repository/ComplaintsRepos');
const postRepository = require("../server/repository/PostRepos");
const adminrepository = require('../server/repository/AdminRepos');
const {formatChat} = require('../server/helpers/formatter');
const {ensureAuthenticated} = require('../server/config/auth');

//-- display admin index page
router.get('/', ensureAuthenticated, (req, res)=>{
    complaintRepository.findJoin({student: [{column: "lastName"}, {column: "firstName"}], complaints:[{column: "complaint"}, {column: "status"}, {column: 'id'}]}, {student: "student_id"})
      .then(allComplaints=>{
        res.render('admin/index', {admin:true, allComplaints});
      })
      .catch(err=>{
          console.log(err);
          req.flash('error', 'Sorry an error occured.');
          res.redirect('/');
      });
})
//-- display the admin signin page
router.get('/signin/', (req, res)=>{
    res.render('admin/signin', {
        pageTitle: 'Complaint System | Signin'
    });
});
//-- Process Admin signin
router.post('/signin/', (req, res, next)=>{
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
            postRepository.findJoin({student: [{column: 'lastName'}, {column:'firstName'}], post: [{column: 'createdAt'}, {column: 'reply'}, {column:'complaint_id'}, {column:'student_id'}, {column: 'user_type'}]}, {student: 'student_id'}, [{table: 'post', column: 'complaint_id', value: complaintId, operator: '='}])
                .then(chat => {
                    if(chat){
                        chat = formatChat(chat);
                    }
                    //console.log(chat);
                    res.render("chat/chats", { admin:true,active:"admin", complaint, chat });
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
    let nDate = new Date();
    let createdAt = nDate.getFullYear() + '-' + (nDate.getMonth()+1) + '-' + nDate.getDate();
    
    let newPost = {
        createdAt,
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

router.get('/todays/complaints/', (req, res)=>{
let today = new Date();

    complaintRepository.findMany([{createdAt: today}], '=')
      .then(todaysComplaints=>{
res.render('admin/index', {admin:true,todaysComplaints});
      })
      .catch(err =>{
console.log(err);
req.flash('error', 'Failed to retrieve complaints');
res.redirect('/admin/');
      });
});

module.exports = router;
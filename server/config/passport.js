const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

//-- Load admin repository
const adminRepository = require('../repository/AdminRepos');
//-- Load student repository
const studentRepository = require('../repository/StudentRepos');
const complaintsRepository = require('../repository/ComplaintsRepos');

//Load send.js
const send = require('../../third_party/send');

module.exports = function (passport, User) {
  
  passport.use(new LocalStrategy({usernameField: 'emailAddress'}, (emailAddress, password, done) =>{
    //-- Match User
    User.findOne([{emailAddress: emailAddress}])
      .then(user => { 
        if (!user) {
          return done(null, false, {message:'No User with such email found'});
        }

        //-- Match User password
        bcrypt.compare(password ,user.password, (err, isMatch) => {
          if(err) throw err;

          if(isMatch) {
            if(user.user_type === 0){//-- is admin
              let logPhoneNos = [];
              complaintsRepository.findJoin(
                {
                  student: [
                    {column: 'phone_no', alias: 'phoneNo'}
                  ]
                },
                {
                  student: 'student_id'
                },
                [
                  {table: 'complaints', column:'status', value: '0', operator: '='}
                ]
              ).then(students=>{
                for (let item of students){
                  if(logPhoneNos.indexOf(item.phoneNo) === -1 && (item.phoneNo !== null)){
                    let phoneNo = item.phoneNo;
                    logPhoneNos.push(phoneNo);

                    send({to: phoneNo, text: 'The Admin is currently online'});

                  }
                }
              })
              .catch(err=>{
                console.log(err);
              })
            }
            return done(null, user, {message: 'Login Successfully'});
          } else {
            return done(null, false, {message: 'Password Incorrect'});
          }
        });
        
      })
      .catch(err => {
        console.log(err);
        return done(null, false, {message: 'Db not responding'});
      });
  }));

  passport.serializeUser(function(user, done){
    
    done(null, {_id:user.id, type: user.user_type});
  });

  passport.deserializeUser(function(key, done){
    User = {};

    if(key.type === 0) User = adminRepository;
    if(key.type === 1) User = studentRepository;
    User.findById(key._id)
     .then((user)=>{
      done(null, user);
    },(err)=>{
      done(err, false);
    });
  });
}
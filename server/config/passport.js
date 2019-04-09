const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

//-- Load admin repository
const adminRepository = require('../repository/AdminRepos');
//-- Load student repository
const studentRepository = require('../repository/StudentRepos');


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
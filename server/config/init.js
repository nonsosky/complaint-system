const bcrypt   = require('bcryptjs');

//-- Admin model
const adminRepository = require('../repository/AdminRepos');
//const Admin = require('../lib/user/Admin');

function adminConfig(){
  adminRepository.findMany([])
    .then(admins => {
      
      if(admins.length === 0 || !admins){
        let myAdmin = {userName:"kennyBrain", emailAddress:"kennyBrain@gmail.com",password:"{kenny8080}"};

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(myAdmin.password, salt, (err, hash) => {
            if(err) throw err;

            myAdmin.password = hash;
            adminRepository.insert(
              myAdmin
            ).catch(err=>console.log(err));
          });
        });

      }
    }).catch(err=>console.log(err));
}


module.exports = {adminConfig};
//-- Module Dependency
const accountSid = 'ACb1cf25f00ff42f7709320b5bca84b136';
const authToken = '3d713987fe93bc7729b36e762431fd21';
const client = require('twilio')(accountSid, authToken);


function send(options = {to: "", text: ""}) {
  return new Promise((resolve, reject)=>{
    const {to, text} = options;
    client.messages
      .create({
        body: options.text,
        from: '+12563776668', //+12563776668
        to: options.to
      })
      .then(message => {
        resolve({sid: message.sid, msg: "message sent."});
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = send;
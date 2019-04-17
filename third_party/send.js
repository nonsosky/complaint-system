//-- Module Dependency
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: "f6e8175a",
  apiSecret: "rIC7zMwrJmDgZTbL"
});

function send(options = {to: "", text: ""}) {
  return new Promise((resolve, reject)=>{
    const {to, text} = options;
    const from = "Complaint System";
    console.log(from);
    nexmo.message.sendSms(from, to, text, (err, responseData) => {
      if (err) {
        reject(err);
      } else {
        if (responseData.messages[0]['status'] === "0") {
          resolve("Message sent successfully.");
        } else {
          reject(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
      }
    });
  });
}

module.exports = send;
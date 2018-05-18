const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment')
const httprequest = require('request')

admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.getMessageFromLine = functions.https.onRequest((request, response) => {
  const strDate = moment().zone('+0700').format('YYYY-MM-DD');
  const staticUser = []
  staticUser['U09470b75b2cb22d87f1a5efaa1163129'] = 'tu'
  staticUser['U1a7d4b01398769ee3b79e3734186b756'] = 'masato'
  staticUser['Uc193f463a3b7015827ad992db356b629'] = 'arm'
  staticUser['Ufe43fd3533861eb2c3148b0fa0524861'] = 'ice'
  staticUser['Ub3e3538f08c5e71c7518f26d76e29699'] = 'wat'
  
  const data = request.body.events["0"]
  const userId = data.source.userId;
  const messageType = data.message.type;
  let messageText = data.message.text.trim();
  if(messageType==="text") {
    if(messageText.startsWith('#daily')){
      const user = staticUser[userId] || 'ton'
      const text = {message: messageText.replace("#daily", user)}

      admin.database().ref('daily/'+strDate+'/'+user).set(text)
      .then(() => {
        response.send('success')
       return
      }).catch((error) => {
        response.send('fail')
      });
    }
  }
 });


exports.get = functions.https.onRequest((request, response) => {
  var config = {
    apiKey: "AIzaSyDmoyeSgVV4sx1XORlvIunuIHbMkwQmDds",
    authDomain: "tn-line-hackathon.firebaseapp.com",
    databaseURL: "https://tn-line-hackathon.firebaseio.com",
    projectId: "tn-line-hackathon",
    storageBucket: "tn-line-hackathon.appspot.com",
    messagingSenderId: "737502471943"
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }
  let result = {}
  let app = firebase.database().ref('/daily/' + request.query.date);
    app.on('value', snapshot => {
      console.log(snapshot.val());
      result = snapshot.val();
    });
  response.send(result);
});

exports.notifyUnsend = functions.https.onRequest((request, response) => {
  admin.database.ref('daily').set({
    id: 1,
    userID: 'userID',
    message: 'test',
    date : '2018-05-17'
  }).then(() => {
    return response.send('success')
  }).catch((error) => {
    return response.send('fail')
  });
});
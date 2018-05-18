require('dotenv').config()
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment')
const httprequest = require('request')
const firebase = require('firebase')
const line = require('@line/bot-sdk');

admin.initializeApp(functions.config().firebase);
const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
}

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.getMessageFromLine = functions.https.onRequest((request, response) => {
//   const strDate = moment().zone('+0700').format('YYYY-MM-DD');
//   const staticUser = []
//   staticUser['U09470b75b2cb22d87f1a5efaa1163129'] = 'tu'
//   staticUser['U1a7d4b01398769ee3b79e3734186b756'] = 'masato'
//   staticUser['Uc193f463a3b7015827ad992db356b629'] = 'arm'
//   staticUser['Ufe43fd3533861eb2c3148b0fa0524861'] = 'ice'
//   staticUser['Ub3e3538f08c5e71c7518f26d76e29699'] = 'wat'
  
//   const data = request.body.events["0"]
//   const userId = data.source.userId;
//   const messageType = data.message.type;
//   let messageText = data.message.text.trim();
//   if(messageType==="text") {
//     if(messageText.startsWith('#daily')){
//       const user = staticUser[userId] || 'ton'
//       const text = {message: messageText.replace("#daily", user)}

//       admin.database().ref('daily/'+strDate+'/'+user).set(text)
//       .then(() => {
//         response.send('success')
//        return
//       }).catch((error) => {
//         response.send('fail')
//       });
//     }
//   }
//  });


// exports.get = functions.https.onRequest((request, response) => {
//   var config = {
//     apiKey: "AIzaSyDmoyeSgVV4sx1XORlvIunuIHbMkwQmDds",
//     authDomain: "tn-line-hackathon.firebaseapp.com",
//     databaseURL: "https://tn-line-hackathon.firebaseio.com",
//     projectId: "tn-line-hackathon",
//     storageBucket: "tn-line-hackathon.appspot.com",
//     messagingSenderId: "737502471943"
//   };
//   if (!firebase.apps.length) {
//     firebase.initializeApp(config);
//   }
//   let result = {}
//   let app = firebase.database().ref('/daily/' + request.query.date);
//     app.on('value', snapshot => {
//       console.log(snapshot.val());
//       result = snapshot.val();
//     });
//   response.send(result);
// });


const sendMessage = (userid, message) => {
  const client = new line.Client({
    channelAccessToken: 'PN/7gn8noRYlUzxWPNzdLtxgkDJw0AEn9Z9ywMf6sgJBa6eViStegOocpYLrBngchOZX12mcBnErf8X6tM9D1MNRPvdJyEtZhIgas4/CyVibN3vbnIM0wCZ82Xyn5wTtlACP0Xbqph2tkKM4GnqaoQdB04t89/1O/w1cDnyilFU='
  });
  
  const messagesend = {
    type: 'text',
    text: message
  };
  
  return client.pushMessage(userid, messagesend)
}

exports.notifyUnsend = functions.https.onRequest((request, response) => {
  let lists = []
  let all = true

  firebase.database().ref(`daily/2018-05-17`).orderByValue().on('value', (dailies) => {
    dailies.forEach((daily) => {
      lists.push(daily.key)
    })
  })

  firebase.database().ref('users').orderByValue().on('value', (usersData)=> {
    console.log(lists)
    usersData.forEach((user) => {
      console.log(user.key)
      if (!lists.includes(user.key)) {
        let all = false        
        sendMessage(user.key, `คุณ ${user.val().name} ส่ง daily ด้วยค่ะ`)
      }
    })
  })
  // if (all) {
  //   sendMessage('', 'Daily ส่งมาครบแล้ว')
  //   response.status(200).send('success')
  // } else {
  //   response.status(200).send('fail')
  // }
});
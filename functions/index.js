const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment')
const Client = require('@line/bot-sdk').Client;

admin.initializeApp(functions.config().firebase);

const sendMessage = (userId, message) => {
  const client = new Client({
    channelAccessToken: 'PN/7gn8noRYlUzxWPNzdLtxgkDJw0AEn9Z9ywMf6sgJBa6eViStegOocpYLrBngchOZX12mcBnErf8X6tM9D1MNRPvdJyEtZhIgas4/CyVibN3vbnIM0wCZ82Xyn5wTtlACP0Xbqph2tkKM4GnqaoQdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'f1b4e5c6783a0eb2f2b3e265c597871d'
  });
  return client.pushMessage(userId, { type: 'text', text: message });
}

const getUsersId = () => new Promise(((resolve, reject) => {
  let result = {}
  let app = admin.database().ref('/users')
  app.on('value', snapshot => {
    result = snapshot.val();
    if (result) {
      return resolve(Object.keys(result))
    } else {
      return reject(new Error('not found'))
    }
  });
}))

const getUsers = () => admin.database().ref('/users').orderByValue().once('value')

exports.sendNotiForReportDaily = functions.https.onRequest(() => {
  const message = 'กรุณาส่ง Daily ด้วยค่ะ'
  getUsersId()
  .then((result) => {
    sendMessage(result, message)
    return
  })
  .catch(() => {
    console.log('fail')
  })
})

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
  let lists = []
  let sendUsers = []
  const date = moment().format('YYYY-MM-DD')
  admin.database().ref(`/daily/${date}`)
  .once('value')
  .then((dailies) => {
    dailies.forEach((daily) => {
      lists.push(daily.key)
    })
    return lists
  })
  .then(() => getUsers())
  .then((usersData) => {
    console.log(lists)
    usersData.forEach((user) => {
      if (!lists.includes(user.key)) {
        sendUsers.push(sendMessage(user.key, `คุณ ${user.val().name} ส่ง daily ด้วยค่ะ`))
      }
    })
    return sendUsers
  })
  .then(() => Promise.all(sendUsers))
  .then(() => {
    return response.status(200).json('success')
  })
  .catch(error => {
    return response.status(500).json(error.message)
  })
})


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

const getUsers = () => firebase.database().ref('users').orderByValue().once('value')

exports.notifyUnsend = functions.https.onRequest((request, response) => {
  let lists = []
  let sendUsers = []
  const date = moment().zone('+0700').format('YYYY-MM-DD')
  firebase.database().ref(`daily/${date}`)
  .once('value')
  .then((dailies) => {
    dailies.forEach((daily) => {
      lists.push(daily.key)
    })
    return lists
  })
  .then(() => getUsers())
  .then((usersData) => {
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
    return response.status(500).json(error)
  })
});
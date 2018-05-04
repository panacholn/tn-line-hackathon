const functions = require('firebase-functions');
const firebase = require('firebase');
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

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
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.submitGame = functions.https.onCall((data, context) => {

      var ref = admin.database().ref();

      var number = Math.floor(Math.random() * (10)) + 1;

      return ref.update({ Points: number });

});

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.submitGame = functions.https.onCall((data, context) => {

      var ref = admin.database().ref('/games');



      //return ref.update({ Game: data.winner });

      var newGame = ref.push();
      newGame.set({
        winner: data.winner,
        loser: data.loser
      });

});

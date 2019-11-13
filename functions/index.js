const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.submitGame = functions.https.onCall((data, context) => {

      var gamesRef = admin.database().ref('/games');
      var playerGamesRef = admin.database().ref('/playerGames');


      var gameData = {
        winners: data.winners,
        losers: data.losers,
        timestamp: admin.database.ServerValue.TIMESTAMP
      }
      //return gamesRef.update({ Game: data.winner });

      var newGame = gamesRef.push();
      newGame.set(gameData);

      data.winners.concat(data.losers).forEach(function(entry) {
        var game = playerGamesRef.child(entry).push(gameData);
        game.set(gameData);
      });

});

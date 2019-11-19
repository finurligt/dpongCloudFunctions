const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//fuck transactions. De funkar inte alls. Aldrig igen.
exports.submitGame = functions.https.onCall((data, context) => {
  var gamesRef = admin.database().ref('/games');
  var playerGamesRef = admin.database().ref('/playerGames');
  var playersRef = admin.database().ref('/players');

  //this wont generate any error is the log,
  //only "Ignoring exception from a finished function"
  //if u want logged errors:
  //hardcode post variable or catch errors and log manually
  playersRef.transaction(function(post) {

    //calculating average team ratings
    if(post==null) {
      console.log("post is null, hopefully firebase will retry");
      return 0;
    } else {
      var winnersRating = 0;
      var losersRating = 0;
      data.winners.forEach(function(entry) {
        winnersRating+=post[entry].rating;
      });

      data.losers.forEach(function(entry) {
        losersRating+=post[entry].rating;
      });

      winnersRating/=data.winners.length;
      losersRating/=data.losers.length;

      //insert elo math here
      var expectedA = 1 / (1 + Math.pow(10,(losersRating-winnersRating)/400));

      var kValue = 40;
      var ratingChange = Math.round(kValue*(1-expectedA));

      data.winners.forEach(function(entry) {
        post[entry].rating+=ratingChange;
      });

      data.losers.forEach(function(entry) {
        post[entry].rating-=ratingChange;
      });

      //below is game logging
      var gameData = {
        winners: data.winners,
        losers: data.losers,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        rating: ratingChange
      }

      var newGame = gamesRef.push();
      newGame.set(gameData);

      data.winners.concat(data.losers).forEach(function(entry) {
        //add data to players "match histories"
        var game = playerGamesRef.child(entry).push(gameData);
        game.set(gameData);
      });

      return post;
    }

  }, function(error, committed, snapshot) {
    if (error) {
        console.log("error in transaction");
    } else if (!committed) {
        console.log("transaction not committed");
    } else {
        console.log("Transaction Committed");
    }
  }, true);
});

exports.registerUser = functions.https.onCall((data, context) => {
  admin.auth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.displayName,
  });
});

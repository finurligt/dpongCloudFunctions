const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//fuck transactions. De funkar inte alls. Aldrig igen.
exports.submitGame = functions.https.onCall((data, context) => {
  var gamesRef = admin.database().ref('/games');
  var playerGamesRef = admin.database().ref('/playerGames');
  var playersRef = admin.database().ref('/players');

  playersRef.transaction(function(post) {
    //calculating average team ratings
    if(post==null) {
      console.log("post is null, hopefully firebase will retry");
      return 0;
    }
    var winnersRating = 0;
    var losersRating = 0;
    data.winners.forEach(function(entry) {
      console.log(post);
      console.log(entry);
      console.log(post[entry]);
      winnersRating+=entry[entry].rating;
    });

    data.losers.forEach(function(entry) {
      losersRating+=playersSnapshot.val()[entry].rating;
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
    return post
  }, function(error, committed, snapshot) {
    if (error) {
        console.log("error in transaction");
    } else if (!committed) {
        console.log("transaction not committed");
    } else {
        console.log("Transaction Committed");
    }
  }, true
);

  //below is game logging, not as important to get right
  //so not done in transaction
  var gameData = {
    winners: data.winners,
    losers: data.losers,
    timestamp: admin.database.ServerValue.TIMESTAMP
  }
  //return gamesRef.update({ Game: data.winner });

  var newGame = gamesRef.push();
  newGame.set(gameData);



  data.winners.concat(data.losers).forEach(function(entry) {
    //add data to players "match histories"
    var game = playerGamesRef.child(entry).push(gameData);
    game.set(gameData);
  });
});

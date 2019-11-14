const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//it might be better to do all this in a single transaction()
//cuz something weird happens when i do it like this and the
//transaction() of elo points fails a lot
//(its ok tho firebase retries until it succeeds)
//but im too lazy
exports.submitGame = functions.https.onCall((data, context) => {
  var gamesRef = admin.database().ref('/games');
  var playerGamesRef = admin.database().ref('/playerGames');
  var playersRef = admin.database().ref('/players');

  //calculating average team ratings

  var winnersRating = 0;
  var losersRating = 0;
  playersRef.once("value").then(function(playersSnapshot) {
    data.winners.forEach(function(entry) {
      console.log(playersSnapshot.val());
      console.log(entry);
      console.log(playersSnapshot.val()[entry]);
      winnersRating+=playersSnapshot.val()[entry].rating;
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
      playersRef.child(entry).transaction(function(post) {
        console.log(playersRef);
        console.log(playersRef.child(entry));
        console.log(entry);
        console.log(post);
        if (post!=null) {
          post.rating+=ratingChange;
        }
        return post;
      });
    });
  });

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

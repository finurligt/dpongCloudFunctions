const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//fuck transactions. De funkar inte alls. Aldrig igen.
exports.submitGame = functions.https.onCall((data, context) => {
  var gamesRef = admin.database().ref('/games');
  var playerGamesRef = admin.database().ref('/playerGames');
  var playersRef = admin.database().ref('/players');

  var promise = new Promise((resolve,reject) => {
    //this wont generate any error is the log,
    //only "Ignoring exception from a finished function"
    //if u want logged errors:
    //hardcode post variable or catch errors and log manually
    var winnersPromiseArray = [];
    data.winners.forEach(function(entry) {
      winnersPromiseArray.push(admin.database().ref('/players/'+entry).once('value'));
    });
    var losersPromiseArray = [];
    data.losers.forEach(function(entry) {
      losersPromiseArray.push(admin.database().ref('/players/'+entry).once('value'));
    });
    Promise.all([Promise.all(winnersPromiseArray),Promise.all(losersPromiseArray)]).then(function(arrayOfArray) {
      var winnersArray = arrayOfArray[0];
      var losersArray = arrayOfArray[1];

      console.log(arrayOfArray);

      //calculating average team ratings
      var winnersRating = 0;
      var losersRating = 0;
      winnersArray.forEach(function(entry) {
        winnersRating+=entry.val().rating;
      });

      losersArray.forEach(function(entry) {
        losersRating+=entry.val().rating;
      });

      winnersRating/=winnersArray.length;
      losersRating/=losersArray.length;

      //insert elo math here
      var expectedA = 1 / (1 + Math.pow(10,(losersRating-winnersRating)/400));

      var kValue = 40;
      var ratingChange = Math.round(kValue*(1-expectedA));

      winnersArray.forEach(function(entry) {
        admin.database().ref('/players/'+entry.val().name).transaction(function(post) {
          if (post==null) {
            return 0;
          } else {
            post.rating+=ratingChange;
            return post;
          }
        });
      });

      losersArray.forEach(function(entry) {
        admin.database().ref('/players/'+entry.val().name).transaction(function(post) {
          if (post==null) {
            return 0;
          } else {
            post.rating-=ratingChange;
            return post;
          }
        });
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

      gameData["isWinner"]=true;
      data.winners.forEach(function(entry) {
        //add data to players "match histories"
        var game = playerGamesRef.child(entry).push(gameData);
        game.set(gameData);
      });

      gameData["isWinner"]=false;
      data.losers.forEach(function(entry) {
        //add data to players "match histories"
        var game = playerGamesRef.child(entry).push(gameData);
        game.set(gameData);
      });

      resolve({
        result: "success",
      });
    });
  });

  //await promise;
  //if (promise.result="0") {
  //  return 0;
  //}
  //else return promise;
  return promise;
});

exports.selectUsername = functions.https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    if (data.username==null) {
      resolve({
        result: "fail: no username entered"
      })
    }
    admin.database().ref('/players/'+data.username).once('value').then(function(snapshot) {
      if (snapshot.val()!=null) {
        console.log("username exists");
        resolve({
          result: "fail: username allready exists"
        })
      } else if (typeof context.auth == 'undefined') {
        resolve({
          result: "no user logged in"
        })
      } else {
        admin.auth().getUser(context.auth.uid).then(function(user) {
          if (user.displayName==null) {
            console.log("actually setting username");
            admin.database().ref('/players/'+data.username).set({
              name: data.username,
              rating: 1200,
            });

            admin.auth().updateUser(context.auth.uid, {
              displayName: data.username
            }).then(function(updateUser) {
             console.log(updateUser);
             resolve({
               result: "success",
             })
            })
          }
        })
      }
    });
  });
});

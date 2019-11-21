const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//fuck transactions. De funkar inte alls. Aldrig igen.
exports.submitGame = functions.https.onCall((data, context) => {
  var gamesRef = admin.database().ref('/games');
  var playerGamesRef = admin.database().ref('/playerGames');
  var playersRef = admin.database().ref('/players');

  return new Promise((resolve,reject) => {
    //this wont generate any error is the log,
    //only "Ignoring exception from a finished function"
    //if u want logged errors:
    //hardcode post variable or catch errors and log manually

    playersRef.transaction(function(post) {


      if(post==null) {
        console.log("post is null, hopefully firebase will retry");
        return 0;
      } else {
        //check input data
        var userIsInGame=false;

        data.winners.concat(data.losers).forEach(function(entry) {
          if (post[entry]) {
            console.log("player exists: " + entry);
          } else {
            resolve({
              result: "player doesnt exist: " + entry
            })
            return;
          }
        })

        //calculating average team ratings
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
          resolve({
            result: error
          })
      } else if (!committed) {
          console.log("transaction not committed");
          resolve({
            result: "transaction not committed"
          })
      } else {
          console.log("Transaction Committed");
          resolve({
            result: "success"
          })
      }
    }, true);
  })
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
      } else {
        console.log("username does not exist");
        admin.database().ref('/players/'+data.username).set({
          name: data.username,
          rating: 1200,
        });

        admin.auth().getUser(context.auth.uid).then(function(user) {
          if (user.displayName==null) {
            admin.auth().updateUser(context.auth.uid, {
              displayName: data.username
            }).then(function(updateUser) {
             console.log(updateUser);
             resolve({
               result: "success",
             })
           })
         } else {
           resolve({
             result: "user allready has a username"
           })
         }
        })



      }
    });
  });



  //.then(function(userRecord) {
  //  admin.database().ref('players/' + data.displayName).set({
  //    name: data.displayName,
  //    rating: 1200
  //  });
  //});


});

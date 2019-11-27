var id;

//get id
var query = window.location.search.substring(1);
var vars = query.split("&");
for (var i=0;i<vars.length;i++) {
  var pair = vars[i].split("=");
  if(pair[0] == "id"){id = pair[1];}
}

firebase.database().ref('/players/').once('value').then(function(snapshot) {
  if (id=="") {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        id=user.displayName;
        document.getElementById('pofile-li').classList.add("active");
      }
      setUpProfile(snapshot);
    });
  } else {
    setUpProfile(snapshot);
  }

});

function setUpProfile(snapshot) {
  var player = snapshot.val()[id];
  var players = Object.values(snapshot.val()).sort(function(a, b) {
    return b.rating-a.rating;
  }).map(a => a.name);
  if (player==null) {
    document.getElementById('user-not-found').style.display="block";
  } else {
    document.getElementById('profile').style.display="block";
    document.getElementById('name').innerHTML=player.name;
    document.getElementById('rating').innerHTML=player.rating;
    document.getElementById('rank').innerHTML=players.indexOf(id)+1;
  }
  firebase.database().ref('/playerGames/' + id).once('value').then(function(snapshot) {
    if (snapshot.val()!=null) {
      fillTable(Object.values(snapshot.val()))
    }
  });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hours = '' + d.getHours(),
        minutes = '' + d.getMinutes();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    if (hours.length < 2)
        hours = '0' + hours;
    if (minutes.length < 2)
        minutes = '0' + minutes;
    return [year, month, day].join('-')+" "+hours + ":" + minutes;
}


function fillTable(data) {

  var gamesArray = Object.values(data);

  gamesArray = gamesArray.sort(function(a ,b) {
    return b.timestamp-a.timestamp;
  })

  console.log(gamesArray);

  const tableBody = document.getElementById('tableBody');
  let dataHtml = '';
  gamesArray.forEach(function(child) {
    dataHtml += `<tr><td><a href="#">${child.winners.join(", ")}</a></td><td><a href="#">${child.losers.join(", ")}</a></td><td><a href="#">${child.rating}</a></td><td><a href="#">${formatDate(new Date(child.timestamp))}</a></td></tr>`
  });

  tableBody.innerHTML = dataHtml;

}

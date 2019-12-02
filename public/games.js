
firebase.database().ref('/games/').once('value').then(function(snapshot) {
  if (snapshot.val()!=null) {
    fillTable(Object.values(snapshot.val()))
  }
});

document.getElementById('listings-li').classList.add("active");

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
    dataHtml += `<tr><td><a href="profile.html?id=${child.winners[0]}">${child.winners.join(", ")}</a></td><td><a href="profile.html?id=${child.losers[0]}">${child.losers.join(", ")}</a></td><td><a href="#">${child.rating}</a></td><td><a href="#">${formatDate(new Date(child.timestamp))}</a></td></tr>`
  });

  tableBody.innerHTML = dataHtml;

}

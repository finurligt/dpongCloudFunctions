var submitGame = firebase.functions().httpsCallable('submitGame');

document.getElementById('submit-li').classList.add("active");

var winnersToSubmit = new Set();
var losersToSubmit = new Set();

function submitButton() {
  /**
  Use this function to submit a game. If more fields are needed just add them
  and I will fix backend later.
  **/
  var winnersArray = Array.from(winnersToSubmit);
  var loserArray = Array.from(losersToSubmit);
  console.log("Submitting game");
  console.log(winnersArray);
  console.log(loserArray);
  submitGame({
    winners: winnersArray,
    losers: loserArray
  }).then(function(submitReturn) {
    if (submitReturn.data.result=="success") {
      console.log(submitReturn.data.result);
      window.location.href = 'index.html';
      //should perhaps lead to a complete match history?
      //or "profile.html?id=" if currentUser has to be in the game
    } else {
      window.alert(submitReturn.data.result);
    }
  })
}

var playersRef = firebase.database().ref('players')
playersRef.once('value').then(function(snapshot) {
  var playersArray = Object.values(snapshot.val());
  var autocompleteArray = [];
  playersArray.forEach(function(player) {
    autocompleteArray.push(player.name);
  });
  autocompleteGame(document.getElementById('winners'),autocompleteArray);
  autocompleteGame(document.getElementById('losers'),autocompleteArray);
})

function submitWinner(winner) {
  winnersToSubmit.add(winner);
  var playerbox = document.createElement('h4');
  playerbox.classList.add("player-box");
  playerbox.innerHTML=winner;
  var closeButton = document.createElement("button");
  closeButton.classList.add("close");
  closeButton.type="close";
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.innerHTML= '<span aria-hidden="true">&times;</span>';
  closeButton.addEventListener("click", function(e) {
    console.log("hello");
    this.parentNode.style.display="none";
    winnersToSubmit.delete(winner);
  });
  playerbox.appendChild(closeButton);
  document.getElementById("winners-box-container").appendChild(playerbox);
}

function submitLoser(loser) {
  if (!losersToSubmit.has(loser)&&(!winnersToSubmit.has(loser))) {
    losersToSubmit.add(loser);
    var playerbox = document.createElement('h4');
    playerbox.classList.add("player-box");
    playerbox.innerHTML=loser;
    var closeButton = document.createElement("button");
    closeButton.classList.add("close");
    closeButton.type="close";
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.innerHTML= '<span aria-hidden="true">&times;</span>';
    closeButton.addEventListener("click", function(e) {
      console.log("hello");
      this.parentNode.style.display="none";
      losersToSubmit.delete(loser);
    });
    playerbox.appendChild(closeButton);
    document.getElementById("losers-box-container").appendChild(playerbox);
  }
}

function autocompleteGame(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            //inp.value = this.getElementsByTagName("input")[0].value;
            inp.value="";
            if(inp==document.getElementById("winners")) {
              submitWinner(this.getElementsByTagName("input")[0].value);
            } else if (inp==document.getElementById("losers")) {
              submitLoser(this.getElementsByTagName("input")[0].value);
            }
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        gameAddActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        gameAddActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function gameAddActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

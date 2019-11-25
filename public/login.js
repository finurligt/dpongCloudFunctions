
const loginForm = document.getElementById("login-form");

function setUp() {
  loginForm.style.display = "none";
}
setUp();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    window.location.href = 'index.html';
    console.log(user + " just signed in.")
    console.log(JSON.parse(user));
    //show log out button
  } else {
    //no user signed
    document.getElementById('login-li').classList.add("active");
    loginForm.style.display="block";
  }
});

function login() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    window.alert(errorMessage);
  });
}

document.getElementById('login-button').addEventListener("click", function(event) {
  event.preventDefault();
})

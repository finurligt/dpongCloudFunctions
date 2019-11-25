var selectUsername = firebase.functions().httpsCallable('selectUsername');


function setUp() {
  var registerForm=document.getElementById("register-form");
  var usernameForm=document.getElementById("username-form");




  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      //hide register, show pick username
      registerForm.style.display="none";
      usernameForm.style.display="block";

    } else {
      //no user signed
      registerForm.style.display="block";
      usernameForm.style.display="none";
    }
  });

}
setUp();


function registerUser() {
  var email = document.getElementById('email')
  var password = document.getElementById('password')

  firebase.auth().createUserWithEmailAndPassword(email.value, password.value).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error);
    window.alert(error.message);
    // ...
  });
}

document.getElementById('register-button').addEventListener("click", function(event) {
  event.preventDefault();
})


function selectUsernameHelp() {
  var username = document.getElementById('username')

  selectUsername({
    username: username.value,
  }).then(function(returnValue) {
    if (returnValue.data.result=="success") {
      window.location.href = 'index.html';
    } else {
      window.alert(returnValue.data.result);
    }
  })
}

console.log("loaded javascript.js");

$(document).ready(function () {
   $("#registrationForm").submit(function (e) {
      e.preventDefault(); // avoid to execute the actual submit of the form.

      console.log("intercepted submit");

      //create object
      var form = $(this);
      var formData = {
         classID: $("input[name=classID]").val(),
         email: $("input[name=email]").val(),
      };
      var method = form.attr("method");
      var url = form.attr("action");

      //get id token
      var user = firebase.auth().currentUser;
      if (user) {
         user
            .getIdToken(/* forceRefresh */ true)
            .then(function (idToken) {
               //send request
               $.ajax({
                  type: method,
                  url: url,
                  data: JSON.stringify(formData), // serializes the form's elements.
                  contentType: "application/json",
                  beforeSend: function (xhr) {
                     //add id token to header
                     xhr.setRequestHeader("Authorization", "Bearer " + idToken);
                  },
               })
                  .done(function (result) {
                     alert(result); // show response from the server.
                  })
                  .fail(function (result) {
                     alert(result.responseText);
                  })
                  .always(function (result) {
                     //clear form
                  });
            })
            .catch(function (error) {
               console.log("NOT SIGNED IN");
               alert("not signed in");
            });
      } else {
         console.log("NOT SIGNED IN");
         alert("not signed in");
      }
   });
});

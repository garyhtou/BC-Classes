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

      //send request
      $.ajax({
         type: method,
         url: url,
         data: JSON.stringify(formData), // serializes the form's elements.
         contentType: "application/json",
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
   });
});

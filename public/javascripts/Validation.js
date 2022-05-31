jQuery.validator.addMethod(
  "lettersonly",
  function (value, element) {
    return this.optional(element) || /^[\w\s]+[a-z]+$/i.test(value);
  },
  "Letters only please"
);

$(document).ready(() => {
  $("#userSignup").validate({
    rules: {
      name: {
        required: true,
        minlength: 4,
        maxlength: 20,
        lettersonly: true,
      },
      email: {
        required: true,
        email: true,
      },
      number: {
        required: true,
        matches: "[0-9]",
        minlength: 10,
        maxlength: 10,
      },
      password: {
        required: true,
        minlength: 3,
      },
      cPassword: {
        required: true,
        equalTo: "#password",
      },
    },
  });
});

$(document).ready(() => {
  $("#userLogin").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 3,
      },
    },
  });
});
$(document).ready(() => {
  $("#userLogin").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 3,
      },
    },
  });
});

$(document).ready(() => {
  $("#vendorSignup").validate({
    rules: {
      name: {
        required: true,
        maxlength: 20,
        minlength: 5,
        lettersonly: true,
      },
      email: {
        required: true,
        email: true,
      },
      number: {
        required: true,
        minlength: 10,
        maxlength: 10,
        matches: "[0-9]+",
      },
      country: {
        required: true,
      },
      state: {
        required: true,
      },
      district: {
        required: true,
      },
      password: {
        required: true,
        minlength: 3,
      },
      cPassword: {
        required: true,
        equalTo: "#password",
      },
      idProof: {
        required: true,
      },
    },
  });
});

$(document).ready(() => {
  $("#searchRooms").validate({
    rules: {
      location: {
        required: true,
      },
      checkIn: {
        required: true,
      },
      checkOut: {
        required: true,
      },
      room: {
        required: true,
      },
      guests: {
        required: true,
      },
    },
  });
});

// $(function () {
//     $("#date-in").datepicker();
// });
// $(function () {
//     $("#date-out").datepicker();
// });

// //table for admin dashboard
// $(document).ready(function () {
//     $('#example').DataTable();
// });

// to view id of vendors in admin panel
$("#exampleModal").on("shown.bs.modal", () => {
  $("#myInput").trigger("focus");
});

// $("#exampleModal").on("hidden.bs.modal", function(){
//     $(".modal-body1").html("");
// });

// otp verification
document.addEventListener("DOMContentLoaded", (event) => {
  function OTPInput() {
    const inputs = document.querySelectorAll("#otp > *[id]");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("keydown", (event) => {
        if (event.key === "Backspace") {
          inputs[i].value = "";
          if (i !== 0) inputs[i - 1].focus();
        } else if (i === inputs.length - 1 && inputs[i].value !== "") {
          return true;
        } else if (event.keyCode > 47 && event.keyCode < 58) {
          inputs[i].value = event.key;
          if (i !== inputs.length - 1) inputs[i + 1].focus();
          event.preventDefault();
        } else if (event.keyCode > 64 && event.keyCode < 91) {
          inputs[i].value = String.fromCharCode(event.keyCode);
          if (i !== inputs.length - 1) inputs[i + 1].focus();
          event.preventDefault();
        }
      });
    }
  }
  OTPInput();
});

$(window).bind("pageshow", (event) => {
  if (event.originalEvent.persisted) {
    window.location.reload();
  }
});
$(document).ready(() => {
  $("#userId").validate({
    rules: {
      file: {
        required: true,
      },
    },
  });
});

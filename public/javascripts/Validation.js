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
        digits: true,
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
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function (error, element) {
      if (element.parent('.input-group').length) {
        error.insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    }

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

    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function (error, element) {
      if (element.parent('.input-group').length) {
        error.insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    }
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

    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function (error, element) {
      if (element.parent('.input-group').length) {
        error.insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    }
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
    messages:{
      location: "Please select a location",
        checkOut: "Select time period",
    },
    errorPlacement: function(error, element) {
      element.attr("placeholder", error.text());
      
  }
    
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

var minDate, maxDate;

$(function () {
  $("#min").datepicker();
});

$(function () {
  $("#max").datepicker();
});

$('#max').blur(function () {
  $.fn.dataTable.ext.search.push(


    function (settings, data, dataIndex) {

      var min = new Date($('#min').val())
      var max = new Date($('#max').val())
      var date = new Date(data[3]);

      if (
        (min === null && max === null) ||
        (min === null && date <= max) ||
        (min <= date && max === null) ||
        (min <= date && date <= max)
      ) {

        return true;
      }
      return false;
    }
  );
})





$(document).ready(function () {
  // Create date inputs
  minDate = new Date($('#min'), {
    format: 'MMMM Do YYYY'
  });
  maxDate = new Date($('#max'), {
    format: 'MMMM Do YYYY'
  });

  // DataTables initialisation
  var table = $('#example').DataTable({
    order: [[3, 'asc']]
  });

  // Refilter the table
  $('#min, #max').on('change', function () {
    table.draw();
  });
});



//for sales

var min1Date, max1Date;

$(function () {
  $("#min1").datepicker();
});

$(function () {
  $("#max1").datepicker();
});

$('#max1').blur(function () {
  $.fn.dataTable.ext.search.push(


    function (settings, data, dataIndex) {

      var min1 = new Date($('#min1').val())
      var max1 = new Date($('#max1').val())
      var date = new Date(data[0]);

      if (
        (min1 === null && max1 === null) ||
        (min1 === null && date <= max1) ||
        (min1 <= date && max1 === null) ||
        (min1 <= date && date <= max1)
      ) {

        return true;
      }
      return false;
    }
  );
})

$(document).ready(function () {
  // Create date inputs
  min1Date = new Date($('#min1'), {
    format: 'MMMM Do YYYY'
  });
  max1Date = new Date($('#max1'), {
    format: 'MMMM Do YYYY'
  });

  // DataTables initialisation
  var table = $('#sales').DataTable({
   
  });

  // Refilter the table
  $('#min1, #max1').on('change', function () {
    table.draw();
  });
});

//vendor adding rooms validations


$(document).ready(() => {
  $("#addRooms").validate({
    rules: {
      price: {
        required: true,
      },
      actualPrice: {
        required: true,
      },
      category: {
        required: true,
      },
      qty: {
        required: true,
      },
     
    },
    messages:{
      price: "Please enter an Offer price",
        actualPrice: "Enter the price",
        category: "Choose a category",
        qty: "Enter no of rooms",
       
    },
    errorPlacement: function(error, element) {
      element.attr("placeholder", error.text());
      
  }
    
  });
});

//validation for edit rooms


$(document).ready(() => {
  $("#editRooms").validate({
    rules: {
      price: {
        required: true,
      },
      actualPrice: {
        required: true,
      },
      category: {
        required: true,
      },
      qty: {
        required: true,
      },
     
    },
    messages:{
      price: "Please enter an Offer price",
        actualPrice: "Enter the price",
        category: "Choose a category",
        qty: "Enter no of rooms",
       
    },
    errorPlacement: function(error, element) {
      element.attr("placeholder", error.text());
      
  }
    
  });
});

function addNumber(roomId) {
  $.ajax({
    url: `/ajaxCheck/${roomId}`,
    method: "GET",
    success: (response) => {
      if (response) {
        let count = $("#ajax").html();
        count = parseInt(count) + 1;
        $("#ajax").html(count);
      }
    },
  });
}

function blockUser(userId) {
  $.ajax({
    url: `/admin/block/${userId}`,
    method: "GET",
    success: (response) => {
      if (response) {
        $(`#${userId}`)
          .html("unblock")
          .addClass("btn-success")
          .removeClass("btn-danger ")
          .attr("onclick", `unblockUser('${param1}')`);
      }
    },
  });
}

function unblockUser(userId) {
  $.ajax({
    url: `/admin/unblock/${userId}`,
    method: "GET",
    success: (response) => {
      if (response) {
        $(`#${userId}`)
          .html("Block")
          .addClass("btn-danger")
          .removeClass("btn-success ");

        $;
      }
    },
  });
}

function confirmBook(userId) {
  const file = $("#fileUpload")[0].files[0];
  const fd = new FormData();
  fd.append("theFile", file);

  $.ajax({
    url: `/uploadId/${userId}`,
    method: "post",
    processData: false,
    contentType: false,
    data: fd,
    success: (response) => {
      if (response) {
        $("#payNow").removeClass("disabled").addClass(" ");
        $("#payNow").removeClass("disabled").addClass("");
        $("#imageErr").html("");
      } else {
        $("#imageErr").html("Upload your id proof").css("color", "red");
      }
    },
  });
}

function login(name, email, password) {
  $.ajax({
    url: "/loginBook",
    method: "post",
    data: { name, email, password },
    success: (response) => {
      location.reload();
    },
  });
}

// to auto tab when typing otp

$(".inputs").keyup(function () {
  if (this.value.length == this.maxLength) {
    $(this).next(".inputs").focus();
  }
});

const option = document.getElementsByName("yesno");

function confirmOrder(Mode) {
  console.log(Mode[0].value,Mode[1].value)
  for (let i = 0,length = Mode; i < length; i++) {
    if (Mode[i].checked) {
      console.log(Mode[i].value);
      var paymentMode = Mode[i].value;
      // do whatever you want with the checked radio
      // only one radio can be logically checked, don't check the rest
      break;
    } else {
      console.log(Mode[i].value)
      alert("Please Select Payment mode");
      return false;
    }
  }
  $.ajax({
    url: "/confirmBook",
    method: "post",
    data: { paymentMode },
    success: (data) => {
      if (data.check) {
        razorpayPayment(data.response);
      } else {
        location.href = "/bookingStatus";
      }
    },
  });
}

function razorpayPayment(order) {
  const options = {
    key: "rzp_test_pVpVEwHMBqRS5h", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Bon Voyage",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: (response) => {
      verifyPayment(response, order);
    },
    prefill: {
      name: "Gaurav Kumar",
      email: "gaurav.kumar@example.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#ffc23d",
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
  rzp1.on("payment.failed", (response) => {
    alert('Payment failed ,please try again');
  });
}

function verifyPayment(payment, order) {
  console.log("payment", payment, order, "order");
  $.ajax({
    url: "/verifyPayment",
    data: { payment, order },
    method: "post",
    success: (response) => {
      console.log(response);
      if (response.status) {
        location.href = "/bookingStatus";
      } else {
        console.log("failed");
      }
    },
  });
}

function editProfile() {
  $("#email").removeAttr("disabled");
  $("#number").removeAttr("disabled");
  $("#name").removeAttr("disabled");
  $("#country").removeAttr("disabled");
  $("#state").removeAttr("disabled");
  $("#district").removeAttr("disabled");
  $("#save").removeAttr("disabled");
}

function updateData(userId) {
  name = $("#name").val();
  email = $("#email").val();
  number = $("#number").val();
  country = $("#country").val();
  state = $("#state").val();
  district = $("#district").val();

  $.ajax({
    url: "/updateProfile",
    method: "post",
    data: {
      name,
      email,
      number,
      country,
      state,
      district,
      userId,
    },
    success: (response) => {
      if (response.data) {
        alert("profile updated");
        location.reload();
      }
    },
  });
}

function cancelBooking(bookingId) {
  if (confirm("Do you want to cancel booking?")) {
    $.ajax({
      url: "/cancelBooking",
      method: "post",
      data: { bookingId },
      success: (response) => {
        if (response.status) {
          location.reload();
        }
      },
    });
  }
}

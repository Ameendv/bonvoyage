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
          location.reload()
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
          location.reload()

        $;
      }
    },
  });
}

function confirmBook(userId) {







  $("#payNow").removeClass("disabled").addClass(" ");
  $("#payNow").removeClass("disabled").addClass("");
  $("#imageErr").html("");


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

function confirmOrder(hotel, online) {

  if (hotel.checked) {
    var paymentMode = hotel.value
    console.log(paymentMode);
  } else if (online.checked) {
    var paymentMode = online.value
    console.log(paymentMode)
  } else {
    alert('please select a value')
  }

  if (paymentMode) {
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

function acceptVendor(hotelId) {

  $.ajax({
    url: "/admin/acceptVendor",
    method: 'post',
    data: { hotelId },
    success: (response) => {
      if (response) {
        alert('Vendor request accepted')
        location.reload()
      }
    }
  })
}

function rejectVendor(hotelId) {
  $.ajax({
    url: '/admin/rejectVendor',
    data: { hotelId },
    method: 'post',
    success: (response) => {
      if (response.status) {
        location.reload()
      }
    }
  })
}

function blockVendor(hotelId) {
  $.ajax({
    url: '/admin/blockVendor',
    data: { hotelId },
    method: 'post',
    success: (response) => {
      if (response.status) {
        location.reload()
      }
    }
  })
}

function unBlockVendor(hotelId) {
  $.ajax({
    url: '/admin/unBlockVendor',
    data: { hotelId },
    method: 'post',
    success: (response) => {
      if (response.status) {
        location.reload()
      }
    }
  })
}

function getBookings(userId){
  $.ajax({
    url:'/admin/viewUserBookings',
    method:'get',
    data:{userId},
    success:((response)=>{
      location.href='/admin/viewUserBooking'
    })
  })
}



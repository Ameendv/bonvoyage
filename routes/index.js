const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();
const accountSid = 'AC0a3458453ec2d49d897a813ce1cd243c';
const authToken = '15a5560236561a6b855c9546688e9443';
const client = require('twilio')(accountSid, authToken);
const userHelpers = require('../helpers/user-helpers');

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};

/* GET users listing. */
router.get('/', (req, res) => {
  userHelpers.getLocation().then((locations) => {
    req.session.locations = locations;
    res.render('index', {
      roomSelecter: true,
      user: req.session.loggedIn,
      details: req.session.user,
      locations: req.session.locations,
    });
  });
});

router.get('/signup', (req, res) => {
  res.render('users/signup');
});

router.post('/otpCheck', (req, res) => {
  console.log('otp');
  req.session.userDetails = req.body;
  console.log(req.body);
  const code = '+91';
  const number = code.concat(req.body.number);
  req.session.verifyNumber = number;
  console.log(number);
  client.verify
    .services('VA4a705f250cfb012f021b653b34f9252f')
    .verifications.create({ to: number, channel: 'sms' })
    .then(() => res.render('users/otpVerify', { number: req.body.number })).catch((err) => {
      if (err) {
        res.send("Network Issue please try again later")
      }
    });
});

router.post('/verifyOtp', (req, res) => {
  const otpObj = req.body;
  const toNumber = req.session.verifyNumber;
  const otpArr = Object.values(otpObj);
  const otp = otpArr.join('');

  client.verify
    .services('VA4a705f250cfb012f021b653b34f9252f')
    .verificationChecks.create({ to: toNumber, code: otp })
    .then((verification_check) => {
      if (verification_check.status == 'approved') {
        userHelpers.doSignup(req.session.userDetails).then((data) => {
          if (data.emailExists) {
            res.send('Email already registered');
          } else if (data.status) {
            req.session.loggedIn = true;
            req.session.user = data;
            req.session.userName = req.session.userDetails.name;
            res.redirect('/');
          }
        });
      }
    });
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.render('users/login', { logErr: req.session.logErr });
    req.session.logErr = false;
  }
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      console.log(response);
      req.session.user = response.user;
      req.session.loggedIn = true;
      res.redirect('/');
    } else {
      req.session.logErr = true;
      res.redirect('/login');
    }
  });
});

router.get('/searchRooms', (req, res) => {
  res.redirect('/');
});

router.post('/searchRooms', (req, res) => {
  console.log(req.body);
  const date_1 = new Date(req.body.checkOut);
  const date_2 = new Date(req.body.checkIn);
  const difference = date_1.getTime() - date_2.getTime();
  const TotalDays = Math.ceil(difference / (1000 * 3600 * 24));

  req.session.days = TotalDays;
  const searchDetails = {
    location: req.body.location,
    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut,
    guests: parseInt(req.body.guests),
    room: parseInt(req.body.room),
    days: req.session.days,
  };
  req.session.searchDetails = searchDetails;

  const dates = {};

  dates.checkInDate = dateFormat(req.session.searchDetails.checkIn);
  dates.checkOutDate = dateFormat(req.session.searchDetails.checkOut);

  req.session.dates = dates;

  userHelpers.getRooms(req.body).then((rooms) => {
    res.render('users/roomsList', {
      rooms,
      user: req.session.loggedIn,
      userName: req.session.userName,
      searchDetails: req.session.searchDetails,
      dates: req.session.dates,
      details: req.session.user,
      locations: req.session.locations,
      searchbar: true,
    });
  });
});

router.get('/roomDetails', (req, res) => {
  const roomId = req.query.id;
  userHelpers.getRoomDetails(roomId).then((roomDetails) => {
    req.session.roomDetails = roomDetails;

    res.render('users/roomDetails', {
      user: req.session.loggedIn,
      userName: req.session.userName,
      roomDetails: req.session.roomDetails,
      searchbar: true,
      searchDetails: req.session.searchDetails,
      dates: req.session.dates,
      details: req.session.user,
      locations: req.session.locations,
    });
  });
});

router.get('/bookNow', (req, res) => {
  const roomId = req.query.id;

  userHelpers.getRoomDetails(roomId).then((roomDetails) => {
    const { price } = req.session.roomDetails[0].rooms; // GETTING PRICE OF ROOM
    const rooms = req.session.searchDetails.room; // NUMBER ROOMS
    const { days } = req.session.searchDetails; // NUMBER OF days
    req.session.searchDetails.discount = 0;
    req.session.searchDetails.amount = price * rooms * days;
    req.session.searchDetails.total = price * rooms * days - req.session.searchDetails.discount;

    res.render('users/bookNow', {
      user: req.session.loggedIn,
      userName: req.session.userName,
      roomDetails,
      searchDetails: req.session.searchDetails,
      dates: req.session.dates,
      details: req.session.user,
    });
  });
});

router.post('/confirmBook', (req, res) => {
  req.session.searchDetails.paymentMode = req.body.paymentMode;
  const bookingDetails = {
    bookingId: new ObjectId(),
    hotelId: ObjectId(req.session.roomDetails[0]._id),
    roomId: ObjectId(req.session.roomDetails[0].rooms.roomId),
    hotelName: req.session.roomDetails[0].name,
    category: req.session.roomDetails[0].rooms.category,
    price: req.session.roomDetails[0].rooms.price,
    checkIn: req.session.searchDetails.checkIn,
    checkOut: req.session.searchDetails.checkOut,
    roomCount: req.session.searchDetails.room,
    guests: req.session.searchDetails.guests,
    days: req.session.searchDetails.days,
    billAmt: req.session.searchDetails.amount,
    amountPaid: req.session.searchDetails.total,
    paymentMode: req.session.searchDetails.paymentMode,
    bookingDate: new Date().toISOString().split('T')[0],
    bookingStatus: 'Payment Pending',
  };

  req.session.bookingDetails = bookingDetails;

  userHelpers
    .doBookings(bookingDetails, req.session.user._id)
    .then((status) => {
      if (status) {

        if (req.body.paymentMode === 'hotel') {
          res.json({});
        } else {
          userHelpers
            .generateRazorpay(
              bookingDetails.bookingId,
              bookingDetails.billAmt * 100,
            )
            .then((response) => {
              console.log(response);
              res.json({ response, check: true, user: req.session.user });
            });
        }
        ;
      }
    });
});

router.post('/verifyPayment', (req, res) => {
  console.log('verifying payment');
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers
        .changePaymentStatus(
          req.body['order[receipt]'],
          req.body['payment[razorpay_payment_id]'],
        )
        .then((status) => {
          console.log(status, 'status');
          res.json({ status: true });
        });
    })
    .catch((err) => {
      console.log(err, 'err');
      res.json({ status: false });
    });
});

router.get('/bookingStatus', (req, res) => {
  req.session.bookingDetails.bookingDate = dateFormat(
    req.session.bookingDetails.bookingDate,
  );
  res.render('users/bookingPlaced', {
    booked: true,
    bookingDetails: req.session.bookingDetails,
    dates: req.session.dates,
    user: req.session.loggedIn,
    details: req.session.user,
  });
});

router.post('/paymentFailed', (req, res) => {
  console.log(req.body);
});

router.get('/profile', (req, res) => {
  userHelpers.getProfile(req.query.id).then((details) => {
    res.render('users/profile', {
      user: req.session.loggedIn,
      details: req.session.user,

      details,
    });
  });
});

router.post('/updateProfile', (req, res) => {
  console.log('here');
  const data = {
    name: req.body.name,
    email: req.body.email,
    number: req.body.number,
    district: req.body.district,
    state: req.body.state,
    country: req.body.country,
  };

  userHelpers.updateProfile(data, req.body.userId).then((status) => {
    console.log(status);
    res.json({ data: true });
  });
});

router.post('/uploadId/:id', (req, res) => {
  const image1 = req.files;

  if (image1 == null) {
    res.json(false);
  } else {
    const image1 = req.files.theFile;
    imageUpload('user-ids', req.params.id, image1).then((response) => {
      res.json(response);
    });
  }
});

router.post('/loginBook', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.loggedIn = true;

      res.redirect('/bookNow');
    } else {
      req.session.logErr = true;
      res.redirect('/login');
    }
  });
});

router.get('/viewBookings', (req, res) => {
  userHelpers.getBookings(req.query.id).then((bookings) => {
    const booking = bookings.bookings;

    for (const x in booking) {
      checkIn = new Date(booking[x].checkIn).setHours(0, 0, 0, 0);
      checkOut = new Date(booking[x].checkOut).setHours(0, 0, 0, 0);
      const now = new Date().setHours(0, 0, 0, 0);
      if (now >= checkIn && now <= checkOut) {
        booking[x].isActive = true;
      } else if (now >= checkOut) {
        booking[x].checkedOut = true;
      } else if (now <= checkIn && now <= checkOut) {
        booking[x].canCancel = true;
      }
    }

    res.render('users/viewBookings', {
      booking, viewbookings: true, user: req.session.loggedIn,
      details: req.session.user,
    });
  });
});

router.get('/logout', (req, res) => {
  req.session.loggedIn = false;
  req.session.user = false;
  res.redirect('/');
});

router.get('/ajaxCheck/:id', (req, res) => {
  userHelpers.getRoomDetails(req.params.id).then((roomDetails) => {
    res.json(roomDetails);
  });
});

function dateFormat(date) {
  const dateData = date.split('-'); // For example
  const dateObject = new Date(Date.parse(dateData));
  const dateReadable = dateObject.toDateString();
  const [, M, Dt, Y] = dateReadable.split(' ');
  const dateString = [M, Dt, Y].join(' ');
  return dateString;
}

function imageUpload(location, id, image) {
  return new Promise(async (resolve, reject) => {
    await image.mv(`./public/images/${location}/${id}.jpg`, (err, done) => {
      if (!err) {
        resolve(true);
      } else {
        resolve(err);
      }
    });
  });
}

module.exports = router;

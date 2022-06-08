const express = require('express');

const router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');

const verifyLogin = (req, res, next) => {
  if (req.session.adminLog) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.session.adminLog) {
    admin = req.session.adminLog;
    res.render('admin/adminHome', { admin });
  } else {
    res.redirect('/admin/login');
  }
});

router.get('/login', (req, res) => {
  if (req.session.adminLog) {
    res.redirect('/admin');
  } else {
    res.render('admin/adminLogin', {
      logErr: req.session.logErr,
      preventHeader: true,
    });
  }
});

router.post('/login', (req, res) => {
  adminHelpers.doLogin(req.body).then((state) => {
    if (state) {
      req.session.adminLog = true;
      res.redirect('/admin');
    } else {
      req.session.logErr = true;
      res.redirect('/admin/login');
    }
  });
});

router.get('/vendorsList', verifyLogin, (req, res) => {
  adminHelpers.getVendors().then((vendors) => {
    for (const x in vendors) {
      if (vendors[x].isApproved == true) {
        vendors[x].accepted = true;
      } else if (vendors[x].isApproved == 'rejected') {
        vendors[x].rejected = true;
      } else {
        vendors[x].pending = true;
      }
    }

    res.render('admin/vendorsList', { admin, vendors });
  });
});

router.get('/usersList', verifyLogin, (req, res) => {
  adminHelpers.getUsers().then((users) => {
    res.render('admin/usersList', { admin, users });
  });
});

router.get('/roomsList', (req, res) => {
  adminHelpers.getRooms(req.query.id).then((rooms) => {
    res.render('admin/roomsList', { admin, rooms });
  });
});

router.get('/block/:id', (req, res) => {
  adminHelpers.doBlock(req.params.id).then((status) => {
    res.json(status);
  });
});

router.get('/unblock/:id', (req, res) => {
  adminHelpers.doUnblock(req.params.id).then((status) => {
    res.json(status);
  });
});

router.post('/acceptVendor', (req, res) => {
  adminHelpers 
    .acceptVendor(req.body.hotelId)
    .then((status) => {
      res.json({ status: true });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post('/rejectVendor', (req, res) => {
  adminHelpers
    .rejectVendor(req.body.hotelId)
    .then((status) => {
      res.json({ status: true });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post('/blockVendor', (req, res) => {
  adminHelpers
    .blockVendor(req.body.hotelId)
    .then((status) => {
      res.json({ status: true });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post('/unBlockVendor', (req, res) => {
  adminHelpers
    .unBlockVendor(req.body.hotelId)
    .then((status) => {
      res.json({ status: true });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/viewBookings', (req, res) => {
  adminHelpers
    .viewBookings(req.query.id)
    .then((bookings) => {
      for (const x in bookings) {
        checkIn = new Date(bookings[x].bookings.checkIn).setHours(0, 0, 0, 0);
        checkOut = new Date(bookings[x].bookings.checkOut).setHours(0, 0, 0, 0);
        now = new Date().setHours(0, 0, 0, 0);

        if (now >= checkIn && now <= checkIn) {
          bookings[x].bookings.isActive = true;
        } else if (now < checkIn) {
          if (bookings[x].bookings.bookingStatus === 'cancelled') {
            bookings[x].bookings.cancelled = true;
          }
        } else if (now > checkOut) {
          bookings[x].bookings.checkedOut = true;
        }
      }
      res.render('admin/viewBookings', { admin, bookings });
    })
    .catch((error) => {
      console.error();
    });
});

router.get('/viewUserBooking', (req, res) => {
  
  res.render('admin/viewUserBookings', {
    booking: req.session.booking,

    admin,
  });
});

router.get('/viewUserBookings', (req, res) => {
  userHelpers.getBookings(req.query.userId).then((bookings) => {
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
        if (booking[x].bookingStatus === 'cancelled') {
          booking[x].cancelled = true;
        } else {
          booking[x].canCancel = true;
        }
      }
    }
    req.session.booking = booking;
    res.json(true);
  });
});

router.get('/sales', (req, res) => {
  adminHelpers.getSales().then((sales) => {
    
    res.render('admin/sales', { admin, sales });
  });
});

router.get('/logout', (req, res) => {
  req.session.adminLog = false;
  res.redirect('/admin/login');
});

module.exports = router;

const express = require('express');

const router = express.Router();
const vendorHelpers = require('../helpers/vendor-helpers');

const store = require('../middleware/multer')






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

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.session.vendorLogged) res.render('vendors/vendorHome', { vendor: req.session.vendor });
  else {
    res.redirect('/vendor/login');
  }
});

router.get('/signup', (_, res) => {
  res.render('vendors/vendorSignup', {
    LocationSelector: true,
    preventHeader: true,
  });
});

router.post('/signup', (req, res) => {
  vendorHelpers.doSignup(req.body).then((response) => {
    // req.session.image.id = response
    if (response.exists) {
      console.log('exists');
    } else {
      const image = req.files.idProof;

      imageUpload('ids', response.id, image).then((state) => {
        if (state) {
          req.session.vendorLogged = true;
          req.session.vendor = response;
          res.redirect('/vendor');
        }
      });
    }
  });
});

router.get('/login', (req, res) => {
  res.render('vendors/vendorSignin', {
    mailErr: req.session.emailErr,
    passwordErr: req.session.passwordErr,
    preventHeader: true,
  });
  req.session.emailErr = false;
  req.session.passwordErr = false;
});

router.post('/login', (req, res) => {
  vendorHelpers.doLogin(req.body).then((response) => {
    if (response.logged) {
      req.session.vendorLogged = true;
      req.session.vendorUser = response.user;

      req.session.vendor = response;

      res.redirect('/vendor');
    } else if (response.passwordErr) {
      req.session.passwordErr = true;
      res.redirect('/vendor/login');
    } else if (response.emailErr) {
      req.session.emailErr = true;
      res.redirect('/vendor/login');
    }
  });
});

router.get('/rooms', (req, res) => {
  vendorHelpers.getRooms(req.session.vendor.id).then((rooms) => {
    console.log(rooms, "rooms")
    res.render('vendors/rooms', { rooms, vendor: req.session.vendor });
  });
});

router.get('/addRooms', (req, res) => {
  res.render('vendors/addRooms', {
    vendor: req.session.vendor,
    added: req.session.added,
    imgErr: req.session.imgErr,
  });
  req.session.added = false;
});

router.post('/addrooms', (req, res) => {
  const roomData = {
    price: parseInt(req.body.price),
    category: req.body.category,
    qty: parseInt(req.body.qty),
    actualPrice: parseInt(req.body.actualPrice),
    offer: 0,

    ameneties: {},
  };
  roomData.offer = Math.round(100 - ((roomData.price / roomData.actualPrice) * 100));
  console.log(roomData);
  if (req.body.ac === 'on') {
    roomData.ameneties.ac = true;
  }
  if (req.body.wifi === 'on') {
    roomData.ameneties.wifi = true;
  }
  if (req.body.powerbackup === 'on') {
    roomData.ameneties.powerbackup = true;
  }
  if (req.body.parking === 'on') {
    roomData.ameneties.parking = true;
  }


  vendorHelpers.addRooms(roomData, req.session.vendor.id).then((data) => {
    const image1 = req.files.file;
    const image2 = req.files.file1;
    req.session.roomId = data.roomId;

    imageUpload('rooms', data.roomId + 0, image1).then((state) => {
      if (state) {
        imageUpload('rooms', data.roomId + 1, image2).then((state) => {
          if (state) {
            req.session.added = true;
            res.redirect('/vendor/addRooms');
          }
        });
      }
    });
  });
});

router.get('/editRooms', (req, res) => {
  vendorHelpers.editRoom(req.query.id).then((room) => {
    res.render('vendors/editRooms', {
      vendor: req.session.vendor,
      room,
      edited: req.session.edited,
    });
  });
});

router.post('/editRooms', (req, res) => {
  const roomData = {
    price: parseInt(req.body.price),
    category: req.body.category,
    qty: parseInt(req.body.qty),

    ameneties: {},
  };
  if (req.body.ac === 'on') {
    roomData.ameneties.ac = true;
  }
  if (req.body.wifi === 'on') {
    roomData.ameneties.wifi = true;
  }
  if (req.body.powerbackup === 'on') {
    roomData.ameneties.powerbackup = true;
  }
  if (req.body.parking === 'on') {
    roomData.ameneties.parking = true;
  }

  vendorHelpers.updateRoom(roomData, req.query.id).then(() => {
    if (req.files) {
      const image1 = req.files.file;
      const image2 = req.files.file1;
      imageUpload('rooms', req.query.id + 0, image1).then((state) => {
        if (state) {
          imageUpload('rooms', req.query.id + 1, image2).then((state) => {
            req.session.edited = true;
            res.redirect('/vendor/editRooms');
          });
        }
      });
    } else {
      req.session.edited = true;
      res.redirect('/vendor/editRooms');
    }
  });
});

router.get('/deleteRoom', (req, res) => {
  console.log(req.query.roomId);
  vendorHelpers.deleteRoom(req.query.id).then((status) => {
    res.redirect('/vendor/rooms')

  })
})

router.get('/viewBookings', (req, res) => {
  vendorHelpers.getBookings(req.session.vendor.id).then((bookingData) => {

    for (const x in bookingData) {
      checkIn = new Date(bookingData[x].bookings.checkIn).setHours(0, 0, 0, 0)
      checkOut = new Date(bookingData[x].bookings.checkOut).setHours(0, 0, 0, 0)
      now = new Date().setHours(0, 0, 0, 0)

      if (now >= checkIn && now <= checkIn) {
        bookingData[x].bookings.isActive = true
      } else if (now < checkIn) {

        if (bookingData[x].bookings.bookingStatus === 'cancelled') {
          bookingData[x].bookings.cancelled = true
        } else {
          bookingData[x].bookings.canCancel = true
        }


      } else if (now > checkOut) {
        bookingData[x].bookings.checkedOut = true
      }
    }
    console.log(bookingData);


    res.render('vendors/viewBookings', {
      vendor: req.session.vendor,
      bookingData,
    });
  });
});


router.get('/cancellation',(req,res)=>{
  res.render('vendors/cancellations',{vendor: req.session.vendor})
})


router.get('/logout', (req, res) => {
  req.session.vendorLogged = false;
  res.redirect('/vendor');
});






// router.get('/imageUpload', (req, res) => {
//   res.render("vendors/imageUpload")
// })

// router.post('/imageUpload', store.single("images",12), (req, res, next) => {
//   console.log('hai')
//   const files = req.files;

//   if (!files) {
//     const error = new Error('Please choose files');
//     error.httpStatusCode = 400;
//     return next(error)
//   }
//   console.log(('image uploaded'));
// })



module.exports = router;

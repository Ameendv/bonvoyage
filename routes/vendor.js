const express = require('express');
const userHelpers = require('../helpers/user-helpers');

const router = express.Router();
const vendorHelpers = require('../helpers/vendor-helpers');
const store = require('../middleware/multer');
const fs = require('fs');

const verifyLogin = (req, res, next) => {
  if (req.session.vendorLogged) {
    next();
  } else {
    res.redirect('/vendor/login');
  }
};

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.session.vendorLogged) {
    vendorHelpers.getTotalSales(req.session.vendor.id).then((sales) => {
      vendorHelpers
        .getRoomCount(req.session.vendor.id)
        .then((count) => {
          vendorHelpers
            .getTodaysBookings(req.session.vendor.id)
            .then((bookingCount) => {
              vendorHelpers
                .getReservations(req.session.vendor.id)
                .then((reservations) => {
                  vendorHelpers
                    .getDailySales(req.session.vendor.id)
                    .then((dateSales) => {
                      vendorHelpers
                        .getModeSales(req.session.vendor.id)
                        .then((datas) => {
                          const booking = bookingCount.length;
                          res.render('vendors/vendorHome', {
                            vendor: req.session.vendor,
                            sales,
                            count,
                            booking,
                            reservations,
                            dateSales,
                            datas,
                          });
                        })
                        .catch((error) => {
                          console.log(error);
                          res.redirect('/');
                        });
                    })
                    .catch((error) => {
                      console.log(error);
                      res.redirect('/vendor');
                    });
                })
                .catch((error) => {
                  console.log(error);
                  res.redirect('/vendor');
                });
            })
            .catch((error) => {
              console.log(error);
              res.redirect('/vendor');
            });
        })
        .catch((error) => {
          console.log(error);
          res.redirect('/vendor');
        });
    });
  } else {
    res.redirect('/vendor/login');
  }
});

router.get('/signup', (_, res) => {
  res.render('vendors/vendorSignup', {
    LocationSelector: true,
    preventHeader: true,
  });
});

router.post('/signup', store.array('idProof'), (req, res, next) => {
  vendorHelpers.doSignup(req.body).then((response) => {
    // req.session.image.id = response
    if (response.exists) {
      console.log('exists');
    } else {
      const { files } = req;

      if (!files) {
        const error = new Error('Please select file');
        error.httpStatusCode = 400;
        return next(error);
      }
      const imgArray = files.map((file) => {
        const img = fs.readFileSync(file.path);

        return (encode_image = img.toString('base64'));
      });
      imgArray.map((src, index) => {
        const finalImg = {
          filename: files[index].originalname,
          contentType: files[index].mimetype,
          imageBase64: src,
        };

        vendorHelpers.idUpload(response.id, finalImg).then((status) => {
          req.session.vendorLogged = true;
          req.session.vendor = response;
          res.send('Please wait for admin approval');
        });
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

      if (
        response.vendor.isApproved == true
        && response.vendor.isBlocked != true
      ) {
        res.redirect('/vendor');
      } else if (response.vendor.isBlocked) {
        res.send('Please contact admin');
      } else {
        res.send('please wait untill admin approve your request');
      }
    } else if (response.passwordErr) {
      req.session.passwordErr = true;
      res.redirect('/vendor/login');
    } else if (response.emailErr) {
      req.session.emailErr = true;
      res.redirect('/vendor/login');
    }
  });
});

router.get('/rooms', verifyLogin, (req, res) => {
  vendorHelpers.getRooms(req.session.vendor.id).then((rooms) => {
    console.log(rooms, 'rooms');
    res.render('vendors/rooms', { rooms, vendor: req.session.vendor });
  });
});

router.get('/addRooms', verifyLogin, (req, res) => {
  res.render('vendors/addRooms', {
    vendor: req.session.vendor,
    added: req.session.added,
    imgErr: req.session.imgErr,
  });
  req.session.added = false;
});

router.post('/addrooms', store.array('file'), (req, res) => {
  const roomData = {
    price: parseInt(req.body.price),
    category: req.body.category,
    qty: parseInt(req.body.qty),
    actualPrice: parseInt(req.body.actualPrice),
    offer: 0,

    ameneties: {},
  };
  roomData.offer = Math.round(
    100 - (roomData.price / roomData.actualPrice) * 100,
  );
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
    const { files } = req;

    if (!files) {
      const error = new Error('Please select file');
      error.httpStatusCode = 400;
      return next(error);
    }
    const imgArray = files.map((file) => {
      const img = fs.readFileSync(file.path);

      return (encode_image = img.toString('base64'));
    });

    const finalImg = [];
    imgArray.map((src, index) => {
      const result = finalImg.push({
        filename: files[index].originalname,
        contentType: files[index].mimetype,
        imageBase64: src,
      });
    });

    vendorHelpers
      .roomUpload(data.roomId, finalImg)
      .then((status) => {
        req.session.added = true;
        res.redirect('/vendor/addRooms');
      })
      .catch((error) => {
        console.log(error);
      });

    req.session.roomId = data.roomId;
  }).catch((error) => {
    console.log();
    res.redirect('/vendor')
  });
});

router.get('/editRooms', verifyLogin, (req, res) => {
  vendorHelpers.editRoom(req.query.id).then((room) => {
    res.render('vendors/editRooms', {
      vendor: req.session.vendor,
      room,
      edited: req.session.edited,
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/vendor')
  });
});

router.post('/editRooms', store.array('file'), (req, res) => {
  const roomData = {
    price: parseInt(req.body.price),
    category: req.body.category,
    qty: parseInt(req.body.qty),
    actualPrice: parseInt(req.body.actualPrice),
    offer: 0,

    ameneties: {},
  };
  roomData.offer = Math.round(
    100 - (roomData.price / roomData.actualPrice) * 100,
  );
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
    const { files } = req;

    if (!files) {
      console.log(files, 'not');
      const error = new Error('Please select file');
      error.httpStatusCode = 400;
      return next(error);
    }
    console.log(files, 'not');
    const imgArray = files.map((file) => {
      const img = fs.readFileSync(file.path);

      return (encode_image = img.toString('base64'));
    });

    const finalImg = [];
    imgArray.map((src, index) => {
      const result = finalImg.push({
        filename: files[index].originalname,
        contentType: files[index].mimetype,
        imageBase64: src,
      });
    });
    vendorHelpers.editRoomImage(req.query.id, finalImg).then((status) => {
      req.session.edited = true;
      res.redirect('/vendor/editRooms');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/vendor')
  });
});

router.get('/deleteRoom', verifyLogin, (req, res) => {
  console.log(req.query.roomId);
  vendorHelpers.deleteRoom(req.query.id).then((status) => {
    res.redirect('/vendor/rooms');
  });
});

router.get('/viewBookings', verifyLogin, (req, res) => {
  vendorHelpers.getBookings(req.session.vendor.id).then((bookingData) => {
    for (const x in bookingData) {
      checkIn = new Date(bookingData[x].bookings.checkIn).setHours(0, 0, 0, 0);
      checkOut = new Date(bookingData[x].bookings.checkOut).setHours(
        0,
        0,
        0,
        0,
      );
      now = new Date().setHours(0, 0, 0, 0);

      if (now >= checkIn && now <= checkOut) {
        bookingData[x].bookings.isActive = true;
      } else if (now < checkIn) {
        if (bookingData[x].bookings.bookingStatus === 'cancelled') {
          bookingData[x].bookings.cancelled = true;
        } else {
          bookingData[x].bookings.canCancel = true;
        }
      } else if (now > checkOut) {
        bookingData[x].bookings.checkedOut = true;
      }
    }
    console.log(bookingData, 'Bookings');

    res.render('vendors/viewBookings', {
      vendor: req.session.vendor,
      bookingData,
    });
  });
});

router.get('/cancellation', verifyLogin, (req, res) => {
  vendorHelpers.getCancelled(req.session.vendor.id).then((cancelled) => {
    res.render('vendors/cancellations', {
      vendor: req.session.vendor,
      cancelled,
    });
  });
});

router.get('/sales', verifyLogin, (req, res) => {
  vendorHelpers.getSales(req.query.id).then((sales) => {
    res.render('vendors/sales', { vendor: req.session.vendor, sales });
  });
});

router.get('/logout', verifyLogin, (req, res) => {
  req.session.vendorLogged = false;
  res.redirect('/vendor');
});

router.post('/imageUpload', store.array('images', 12), (req, res, next) => {
  console.log('hai');
  const { files } = req;
  console.log(req.body, req.files);

  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }
  console.log('image uploaded');
});

module.exports = router;

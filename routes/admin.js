const express = require("express");

const router = express.Router();
const adminHelpers = require("../helpers/admin-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.adminLog) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* GET home page. */
router.get("/", (req, res, next) => {
  if (req.session.adminLog) {
    admin = req.session.adminLog;
    res.render("admin/adminHome", { admin });
  } else {
    res.redirect("/admin/login");
  }
});

router.get("/login", (req, res) => {
  if (req.session.adminLog) {
    res.redirect("/admin");
  } else
    res.render("admin/adminLogin", {
      logErr: req.session.logErr,
      preventHeader: true,
    });
});

router.post("/login", (req, res) => {
  adminHelpers.doLogin(req.body).then((state) => {
    if (state) {
      req.session.adminLog = true;
      res.redirect("/admin");
    } else {
      req.session.logErr = true;
      res.redirect("/admin/login");
    }
  });
});

router.get("/vendorsList", verifyLogin, (req, res) => {
  adminHelpers.getVendors().then((vendors) => {
    res.render("admin/vendorsList", { admin, vendors });
  });
});

router.get("/usersList", verifyLogin, (req, res) => {
  adminHelpers.getUsers().then((users) => {
    res.render("admin/usersList", { admin, users });
  });
});

router.get("/roomsList", (req, res) => {
  adminHelpers.getRooms(req.query.id).then((rooms) => {
    res.render("admin/roomsList", { admin, rooms });
  });
});

router.get("/block/:id", (req, res) => {
  adminHelpers.doBlock(req.params.id).then((status) => {
    res.json(status);
  });
});

router.get("/unblock/:id", (req, res) => {
  adminHelpers.doUnblock(req.params.id).then((status) => {
    res.json(status);
  });
});

router.get("/logout", (req, res) => {
  req.session.adminLog = false;
  res.redirect("/admin/login");
});

module.exports = router;





const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const hbs = require("express-handlebars");
const session = require("express-session");
const flash = require('req-flash');
const nocache = require("nocache");


// const fileUpload = require("express-fileupload");
const indexRouter = require("./routes/index");

const adminRouter = require("./routes/admin");
const vendorRouter = require("./routes/vendor");

const app = express();
const db = require("./config/connection");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: `${__dirname}/views/layout/`,
    partialsDir: `${__dirname}/views/partials/`,
  })
);

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
  })
);
app.use(flash());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(nocache());
db.connect((err) => {
  if (err) console.log("Database connection failed");
  else console.log("Connection success");
});

// app.use(fileUpload());
app.use("/", indexRouter);

app.use("/admin", adminRouter);
app.use("/vendor", vendorRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

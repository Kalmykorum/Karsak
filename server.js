const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
///

const app = express();
const port = 3000;
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");

  res.locals.api_error = req.flash("api_error");
  next()
});
const { engine } = require("express-handlebars");

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

const apiRouter = require("./routes/api/routes");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

///
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"));
app.use("/api", apiRouter);
app.use("/", authRouter);
app.use("/", userRouter);
app.get("/", (req, res) => {
  return res.redirect("/dashboard/home");
});
app.listen(port, (err) => {
  if (err) {
    return console.log("error starting server: ", err);
  }
  console.log(`Server listening at http://localhost:${port}`);
});
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

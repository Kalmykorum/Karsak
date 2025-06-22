const express = require('express')
const path = require('path')
const session = require("express-session")
const user = express.Router()
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next(); // User is logged in, proceed to the next middleware/route handler
  } else {
    res.redirect("/login"); // User is not logged in, redirect to login page
  }
}
user.get('/dashboard', isAuthenticated, (req, res) => {
    res.render("../views/dashboard", {
      account: req.session.user,
      title: "Dashboard"
    })
    // res.sendFile(path.join(__dirname, "../pages/dashboard.html"))
})

module.exports = user 
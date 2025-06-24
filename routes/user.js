const express = require('express')
const user = express.Router()
const path = require("path")
function isAuthenticated(req, res, next) {
  if (req.session && req.session.account) {
    next(); // User is logged in, proceed to the next middleware/route handler
  } else {
    return res.redirect("/login"); // User is not logged in, redirect to login page
  }
}
user.get('/dashboard/home', isAuthenticated, (req, res) => {
    return res.render("../views/home", {
      account: req.session.account,
      title: "Karsak | Dashboard",
      layout: "./dashboard"
    })
})

module.exports = user 
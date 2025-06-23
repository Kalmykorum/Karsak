const express = require('express')
const user = express.Router()
function isAuthenticated(req, res, next) {
  if (req.session && req.session.account) {
    next(); // User is logged in, proceed to the next middleware/route handler
  } else {
    return res.redirect("/login"); // User is not logged in, redirect to login page
  }
}
user.get('/dashboard', isAuthenticated, (req, res) => {
    return res.render("../views/dashboard", {
      account: req.session.account,
      title: "Karsak | Dashboard"
    })
})

module.exports = user 
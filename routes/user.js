const express = require('express')
const user = express.Router()
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next(); // User is logged in, proceed to the next middleware/route handler
  } else {
    res.redirect("/login"); // User is not logged in, redirect to login page
  }
}
user.get('/dashboard', isAuthenticated, (req, res) => {
    res.send(req.session.user)
})

module.exports = user 
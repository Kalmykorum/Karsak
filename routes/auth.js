const express = require('express')
const path = require('path')
const auth = express.Router()

auth.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../pages/login.html"));
});
auth.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../pages/signup.html"))
})
module.exports = auth
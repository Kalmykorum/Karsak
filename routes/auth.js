const express = require('express')
const path = require('path')
const auth = express.Router()

auth.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});
auth.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/signup.html"))
})
module.exports = auth
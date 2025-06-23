const express = require('express')
const path = require('path')
const auth = express.Router()

auth.get("/login", (req, res) => {
    res.render("../views/login", {
        title: "Karsak | Login"
    });
});
auth.get("/signup", (req, res) => {
    res.render("../views/signup", {
        title: "Karsak | Signup"
    });
})
module.exports = auth
const express = require("express");
const path = require("path");
const session = require("express-session")
///
const app = express();
const port = 3000;
const apiRouter = require('./routes/api/routes')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
app.use(session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }
}))
///
app.use('/api', apiRouter)
app.use('/', authRouter)
app.use('/', userRouter)
app.get("/", (req, res) => {
	return res.redirect("/dashboard")
}) 
app.listen(port, () => {
		console.log(`Server listening at http://localhost:${port}`);
}) 
app.use((req, res, next) => {
		res.status(404).send("Sorry, can't find that!")
})

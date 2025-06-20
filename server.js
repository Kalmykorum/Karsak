const express = require("express");
const path = require("path");
///

const app = express();
const port = 3000;
const apiRouter = require('./routes/api/routes')
///
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRouter)
///

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
});
///
app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "public/login.html"));
});
	app.get("/signup", (req, res) => {
		res.sendFile(path.join(__dirname, "public/signup.html"))
	})
	app.listen(port, () => {
		console.log(`Server listening at http://localhost:${port}`);
	});

	app.use((req, res, next) => {
		res.status(404).send("Sorry, can't find that!")
	})

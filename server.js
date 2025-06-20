const express = require("express");
const path = require("path");
///

const app = express();
const port = 3000;
const apiRouter = require('./routes/api/routes')
const authRouter = require('./routes/auth')
///
app.use('/api', apiRouter)
app.use('/', authRouter)
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
}) 
app.listen(port, () => {
		console.log(`Server listening at http://localhost:${port}`);
}) 
app.use((req, res, next) => {
		res.status(404).send("Sorry, can't find that!")
})

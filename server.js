const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const { hash } = require("crypto");
const sqlite = require("sqlite3").verbose();
///

const app = express();
const port = 3000;
const db = new sqlite.Database("./users.db", (err) => {
	if (err) {
		console.error("error connecting to database: ", err.message);
	} else {
		console.log("connected to sqlite database");
	}
});
const saltRounds = 10
///

db.run(
	"CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, password TEXT)"
);
///
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
///

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
});
///
app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "public/login.html"));
});
app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	db.get("SELECT name, password FROM users WHERE name = ?", [username], async (err, row) => {
		if (err) {
			console.error("Database error during username check:", err.message);
			return res.status(500).send("An internal server error occurred.");
		}
		try {

			const match = await bcrypt.compare(password, row.password)
			if (match) {

				return res.status(200).send("verified")
			}
			else {
				return res.status(401).send("denied")
			}
		}
		catch {
			return res.status(500).send("comparison error")
		}
	})});
	app.get("/signup", (req, res) => {
		res.sendFile(path.join(__dirname, "public/signup.html"))
	})
	app.post("/signup", async (req, res) => {
		const { username, password } = req.body
		if (!username || !password) {
			return res.status(400).send("username and password required")
		}
		db.get("SELECT name FROM users WHERE name = ?", [username], async (err, row) => {
			if (err) {
				console.error("Database error during username check:", err.message);
				return res.status(500).send("An internal server error occurred.");
			}
			if (row) {
				return res.status(409).send("Username already taken. Please choose a different one."); // 409 Conflict
			}
			const stmt = db.prepare("INSERT INTO users (name, password) VALUES (?, ?)");
			await bcrypt.genSalt(saltRounds,  async(err, salt) => {
				if (err) {
					return;
				}
				await bcrypt.hash(password, salt, (err, hash) => {
					if (err) {
						return
					}
					stmt.run(username, hash)
				})
			})
		})
	})
	app.listen(port, () => {
		console.log(`Server listening at http://localhost:${port}`);
	});

	app.use((req, res, next) => {
		res.status(404).send("Sorry, can't find that!")
	})

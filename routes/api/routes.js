const express = require("express");
const bcrypt = require("bcrypt");
const { hash } = require("crypto");
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./users.db", (err) => {
	if (err) {
		console.error("error connecting to database: ", err.message);
	} else {
		console.log("connected to sqlite database");
	}
});
api = express.Router();
const saltRounds = 10
api.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("username and password required");
  }
  db.get(
    "SELECT name FROM users WHERE name = ?",
    [username],
    async (err, row) => {
      if (err) {
        console.error("Database error during username check:", err.message);
        return res.status(500).send("An internal server error occurred.");
      }
      if (row) {
        return res
          .status(409)
          .send("Username already taken. Please choose a different one."); // 409 Conflict
      }
      const stmt = db.prepare(
        "INSERT INTO users (name, password) VALUES (?, ?)"
      );
      await bcrypt.genSalt(saltRounds, async (err, salt) => {
        if (err) {
          return;
        }
        await bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            return;
          }
          stmt.run(username, hash);
        });
      });
    }
  );
});
api.post("/login", async (req, res) => {
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
module.exports = api;
const express = require("express");
const bcrypt = require("bcrypt");
const sqlite = require("sqlite3").verbose();

const db = new sqlite.Database(
  "./users.db",
  sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
    } else {
      console.log("Connected to SQLite database.");
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`,
        (createErr) => {
          if (createErr) {
            console.error("Error creating users table:", createErr.message);
          } else {
            console.log("Users table ensured.");
          }
        }
      );
    }
  }
);

const api = express.Router();

api.use(express.urlencoded({ extended: true }));
api.use(express.json());

const saltRounds = 10;

api.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('api_error', 'Username and password are required.')
    return res.redirect("/signup")
  }

  db.get(
    "SELECT name FROM users WHERE name = ?",
    [username],
    async (err, row) => {
      if (err) {
        console.error("Database error during username check:", err.message);
        req.flash('api_error', 'An internal server error occurred.')
        return res.redirect("/signup");
      }
      if (row) {
        req.flash('api_error', 'Username already taken, please choose a new one.')
        return res.redirect("/signup")
      }

      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.run(
          "INSERT INTO users (name, password) VALUES (?, ?)",
          [username, hashedPassword],
          function (insertErr) {
            if (insertErr) {
              console.error(
                "Database error during user insertion:",
                insertErr.message
              );
              req.flash('api_error', 'Failed to register user due to server error')
              return res.redirect("/signup")
            }
            req.flash("success_msg", 'Registration successful, please log in.')
            return res.redirect("/login")
          }
        );
      } catch (hashErr) {
        console.error("Error hashing password:", hashErr.message);
        req.flash('api_error', 'An error occured during password processing.')
        return res.redirect("/signup");
      }
    }
  );
});

api.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('api_error', 'Username and password are required')
    return res.redirect('/login');
  }

  db.get(
    "SELECT id, name, password FROM users WHERE name = ?",
    [username],
    async (err, row) => {
      if (err) {
        console.error(
          "Database error during login username check:",
          err.message
        );
        req.flash('api_error', 'An internal server error ocurred.')
        return res.redirect('/login')
      }
      if (!row) {
        req.flash('api_error', 'Invalid username or password')
        return res.redirect('/login')
      }

      try {
        const match = await bcrypt.compare(password, row.password);
        if (match) {
          req.session.account = { id: row.id, username: row.name };
          return res.redirect("/dashboard")
        } 
        else {
          req.flash('api_error', 'Invalid username or password.')
          return res.redirect('/login')
        }
      } catch (compareErr) {
        console.error("Error comparing password:", compareErr.message);
        req.flash('api_error', 'An error occured during password validation')
        return res.redirect('/login')
      }
    }
  );
});
api.post("/logout", (req, res) => {
	req.session.destroy(err => {
		if (err) {
			return res.redirect('/dashboard')
		}
		return res.redirect("/login")
	})
})
module.exports = api;

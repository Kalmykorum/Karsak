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
    return res.status(400).send("Username and password are required.");
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
          .send("Username already taken. Please choose a different one.");
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
              return res
                .status(500)
                .send("Failed to register user due to a server error.");
            }
            console.log(`User ${username} registered with ID: ${this.lastID}`);
            return res
              .status(201)
              .send("User registered successfully. You can now log in.");
          }
        );
      } catch (hashErr) {
        console.error("Error hashing password:", hashErr.message);
        return res
          .status(500)
          .send("An error occurred during password processing.");
      }
    }
  );
});

api.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
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
        return res.status(500).send("An internal server error occurred.");
      }
      if (!row) {
        return res.status(401).send("Invalid username or password.");
      }

      try {
        const match = await bcrypt.compare(password, row.password);
        if (match) {
          req.session.user = { id: row.id, username: row.name };
          return res.status(200).send("Login successful!");
        } else {
          return res.status(401).send("Invalid username or password.");
        }
      } catch (compareErr) {
        console.error("Error comparing password:", compareErr.message);
        return res
          .status(500)
          .send("An error occurred during password validation.");
      }
    }
  );
});

module.exports = api;

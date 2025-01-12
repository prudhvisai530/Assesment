const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const [existingUser] = await db.query(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );

    if (!existingUser || existingUser.length === 0) {
      // Proceed to create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query("INSERT INTO Users (username, password) VALUES (?, ?)", [
        username,
        hashedPassword,
      ]);
      return res.status(201).send({
        status: "ok",
        message: "Signup successful! You can now log in.",
      });
    } else {
      return res.send("Username already exists. Please choose another.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred. Please try again.");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user from database
    const [result] = await db.query("SELECT * FROM Users WHERE username = ?", [
      username,
    ]);

    if (!result || result.length === 0) {
      return res.send("Invalid username or password.");
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.send("Invalid username or password.");
    }

    // Set session data
    req.session.user = { id: user.id, username: user.username };
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred. Please try again.");
  }
});

module.exports = router;

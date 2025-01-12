const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

// Create a connection to the MySQL database
const connection = mysql.createPool({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_DATABASE,
});

module.exports = connection;

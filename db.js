const mysql = require("mysql2/promise");

// Create a connection to the MySQL database
const connection = mysql.createPool({
  host: "localhost", // Database host
  user: "root", // Database username
  password: "Prudhvi@007", // Database password
  database: "users", // Database name
});

module.exports = connection;

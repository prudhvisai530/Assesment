const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const db = require("./db");
const userRoute = require("./routes/user");
const dashboard = require("./routes/dashboard");

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);
app.use("/", dashboard);

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running on ${port}`));

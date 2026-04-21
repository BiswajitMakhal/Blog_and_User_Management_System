require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const dbConnection = require("./app/config/db");

const app = express();

dbConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretsessionkey",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = res.locals.user || null;
  next();
});

const authRoutes = require("./app/routes/authRoute");
const blogRoutes = require("./app/routes/blogRoute");
const userRoutes = require("./app/routes/userRoute");

app.use("/", authRoutes);
app.use("/", blogRoutes);
app.use("/", userRoutes);

app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});

const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

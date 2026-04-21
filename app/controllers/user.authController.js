const User = require("../models/user");
const PasswordHelper = require("../utils/passwordHelper");
const jwt = require("jsonwebtoken");

class AuthController {
  async registerView(req, res) {
    if (req.cookies && req.cookies.token) {
      return res.redirect("/dashboard");
    }
    res.render("register");
  }

  async loginView(req, res) {
    if (req.cookies && req.cookies.token) {
      return res.redirect("/dashboard");
    }
    res.render("login");
  }

  async dashboardView(req, res) {
    res.render("dashboard");
  }

  async registerCreate(req, res) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        req.flash("error_msg", "Please fill in all fields");
        return res.redirect("/register");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        req.flash("error_msg", "User already exists");
        return res.redirect("/login");
      }

      const hashedPassword = await PasswordHelper.hashPassword(password);

      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "User",
      });

      const userData = await user.save();

      if (userData) {
        req.flash("success_msg", "Registration successful! Please login.");
        return res.redirect("/login");
      }

      return res.redirect("/register");
    } catch (err) {
      console.log(err);
      req.flash("error_msg", "Server Error during registration");
      return res.redirect("/register");
    }
  }

  async loginCreate(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error_msg", "Please fill in all fields");
        return res.redirect("/login");
      }

      const user = await User.findOne({ email });
      if (!user) {
        req.flash("error_msg", "User not found. Please register.");
        return res.redirect("/register");
      }

      const isMatch = await PasswordHelper.comparePassword(
        password,
        user.password,
      );
      if (!isMatch) {
        req.flash("error_msg", "Invalid Credentials");
        return res.redirect("/login");
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      if (user) {
        req.flash("success_msg", `Welcome back, ${user.name}!`);
        return res.redirect("/dashboard");
      }

      return res.redirect("/login");
    } catch (err) {
      console.log(err);
      req.flash("error_msg", "Server Error during login");
      return res.redirect("/login");
    }
  }

  async logout(req, res) {
    res.clearCookie("token");
    req.flash("success_msg", "Logged out successfully");
    return res.redirect("/login");
  }
}

module.exports = new AuthController();

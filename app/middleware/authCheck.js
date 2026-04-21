const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  if (req.cookies && req.cookies.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      res.locals.user = req.user;
      return next();
    } catch (error) {
      res.clearCookie("token");
      req.flash("error_msg", "Session expired. Please login again.");
      return res.redirect("/login");
    }
  } else {
    req.flash("error_msg", "Please login to access this page.");
    return res.redirect("/login");
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect("/login");
    }
    if (!roles.includes(req.user.role)) {
      req.flash("error_msg", "You do not have permission to access this page.");
      return res.redirect("back");
    }
    return next();
  };
};

const checkUser = async (req, res, next) => {
    if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            res.locals.user = await User.findById(decoded.id).select("-password");
        } catch (error) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};

module.exports = { protect, authorize,checkUser };

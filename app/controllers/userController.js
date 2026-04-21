const User = require("../models/user");

class UserController {
  async usersView(req, res) {
    try {
      const users = await User.find({ role: "User" }).sort({ createdAt: -1 });
      res.render("users", { users });
    } catch (err) {
      console.log(err);
      req.flash("error_msg", "Server Error while fetching users");
      res.redirect("/dashboard");
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      const userToDelete = await User.findById(userId);
      if (!userToDelete) {
        req.flash("error_msg", "User not found");
        return res.redirect("/users");
      }

      if (userToDelete.role === "Admin") {
        req.flash("error_msg", "Cannot delete an Admin user");
        return res.redirect("/users");
      }

      await User.findByIdAndDelete(userId);
      req.flash("success_msg", "User deleted successfully");
      res.redirect("/users");
    } catch (err) {
      console.log(err);
      req.flash("error_msg", "Server Error during user deletion");
      res.redirect("/users");
    }
  }
}

module.exports = new UserController();

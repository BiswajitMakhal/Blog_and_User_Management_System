const Blog = require("../models/blog");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

class BlogController {
  async blogsView(req, res) {
    try {
      const blogs = await Blog.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            "author.password": 0,
            "author.createdAt": 0,
            "author.updatedAt": 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      res.render("blogs", { blogs });
    } catch (err) {
      console.log(err);
      res.status(500).send("<h1>Server Error</h1>");
    }
  }

  async singleBlogView(req, res) {
    try {
      const blogId = new mongoose.Types.ObjectId(req.params.id);

      const blog = await Blog.aggregate([
        { $match: { _id: blogId, isDeleted: false } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        { $project: { "author.password": 0 } },
      ]);

      if (!blog || blog.length === 0) {
        req.flash("error_msg", "Blog not found");
        return res.redirect("/blogs");
      }

      res.render("view-blog", { blog: blog[0] });
    } catch (err) {
      console.log(err);
      res.redirect("/blogs");
    }
  }

  async createBlogView(req, res) {
    res.render("create-blog");
  }

  async editBlogView(req, res) {
    try {
      const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
      if (!blog) {
        req.flash("error_msg", "Blog not found");
        return res.redirect("/blogs");
      }

      if (blog.author.toString() !== req.user.id && req.user.role !== "Admin") {
        req.flash("error_msg", "Not authorized");
        return res.redirect("/blogs");
      }

      res.render("edit-blog", { blog });
    } catch (err) {
      console.log(err);
      res.redirect("/blogs");
    }
  }

  async createBlog(req, res) {
    try {
      const { title, content } = req.body;
      let image = "";

      if (req.file) {
        image = "/uploads/" + req.file.filename;
      }

      const blog = new Blog({
        title,
        content,
        author: req.user._id,
        image,
      });

      await blog.save();
      req.flash("success_msg", "Blog created successfully");
      res.redirect("/blogs");
    } catch (err) {
      console.log("Create Blog Error: ", err);
      req.flash("error_msg", "Failed to create blog");
      res.redirect("/blogs/create");
    }
  }

  async updateBlog(req, res) {
    try {
      const { title, content } = req.body;
      let updatedData = { title, content };

      const blog = await Blog.findById(req.params.id);

      if (blog.author.toString() !== req.user.id && req.user.role !== "Admin") {
        req.flash("error_msg", "Not authorized");
        return res.redirect("/blogs");
      }

      if (req.file) {
        updatedData.image = "/uploads/" + req.file.filename;

        if (blog.image) {
          const filename = blog.image.split("/").pop();
          const oldPath = path.join(__dirname, "../../uploads", filename);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      }

      await Blog.findByIdAndUpdate(req.params.id, updatedData);
      req.flash("success_msg", "Blog updated successfully");
      res.redirect("/blogs");
    } catch (err) {
      console.log(err);
      req.flash("error_msg", "Server Error during update");
      res.redirect("/blogs");
    }
  }

  async deleteBlog(req, res) {
    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog) {
        req.flash("error_msg", "Blog not found");
        return res.redirect("/blogs");
      }

      if (req.user.role === "Admin") {
        if (blog.image) {
          const filename = blog.image.split("/").pop();
          const imagePath = path.join(__dirname, "../../uploads", filename);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        await Blog.findByIdAndDelete(req.params.id);
        req.flash("success_msg", "Blog permanently deleted");
      } else if (blog.author.toString() === req.user.id) {
        await Blog.findByIdAndUpdate(req.params.id, { isDeleted: true });
        req.flash("success_msg", "Blog moved to trash");
      } else {
        req.flash("error_msg", "Not authorized");
      }

      res.redirect("/blogs");
    } catch (err) {
      console.log(err);
      res.redirect("/blogs");
    }
  }
}

module.exports = new BlogController();

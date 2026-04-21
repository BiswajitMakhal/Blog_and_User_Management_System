const express = require('express');
const Router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, checkUser } = require('../middleware/authCheck');
const upload = require('../middleware/uploadMiddleware');

Router.get('/', checkUser, blogController.blogsView);
Router.get('/blogs', checkUser, blogController.blogsView);

Router.get('/blogs/create', protect, blogController.createBlogView);
Router.get('/blogs/edit/:id', protect, blogController.editBlogView);

Router.get('/blogs/:id', checkUser, blogController.singleBlogView);

// API routes
Router.post('/api/blogs', protect, upload.single('image'), blogController.createBlog);
Router.post('/api/blogs/update/:id', protect, upload.single('image'), blogController.updateBlog);
Router.get('/api/blogs/delete/:id', protect, blogController.deleteBlog);

module.exports = Router;
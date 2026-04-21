const express = require('express');
const Router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authCheck');

Router.get('/users', protect, authorize('Admin'), userController.usersView);
Router.get('/api/users/delete/:id', protect, authorize('Admin'), userController.deleteUser);

module.exports = Router;
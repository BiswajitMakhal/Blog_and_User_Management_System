const express = require('express');
const Router = express.Router();
const authController = require('../controllers/user.authController');
// checkUser import kora holo
const { protect, checkUser } = require('../middleware/authCheck');

Router.get('/register', checkUser, authController.registerView);
Router.get('/login', checkUser, authController.loginView);

Router.get('/dashboard', protect, authController.dashboardView);

Router.post('/api/auth/register', authController.registerCreate);
Router.post('/api/auth/login', authController.loginCreate);
Router.get('/api/auth/logout', protect, authController.logout);

module.exports = Router;
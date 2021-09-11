const express = require('express');
const authController = require('../controllers/authController');
const userController = require('./../controllers/userController');
const isAuth = require('./../middleware/isAuth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/me', isAuth, userController.getMe);

module.exports = router;

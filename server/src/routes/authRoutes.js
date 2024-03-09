const express = require('express');
const router = express.Router();
const { isAuth } = require('../middleware/authentication');

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changeMyPassword,
} = require('../controllers/authController');
const upload = require('../utils/multer');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotpassword', forgotPassword);
router.post('/resetPassword/:token', resetPassword);

router.post('/changeMyPassword', isAuth, changeMyPassword);

module.exports = router;

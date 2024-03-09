const express = require('express');
const {
  searchUser,
  follow,
  unfollow,
  updateProfile,
} = require('../controllers/userController');
const { isAuth } = require('../middleware/authentication');
const upload = require('../utils/multer');
const router = express.Router();

router.get('/search', isAuth, searchUser);

router.patch('/follow/:id', isAuth, follow);
router.patch('/unfollow/:id', isAuth, unfollow);

router.patch('/updateProfile', isAuth, upload.single('avatar'), updateProfile);

module.exports = router;

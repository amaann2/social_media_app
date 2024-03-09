const express = require('express');
const {
  createPost,
  getAllPost,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
} = require('../controllers/postController');
const router = express.Router();
const upload = require('../utils/multer');
const { isAuth } = require('../middleware/authentication');

router
  .route('/')
  .get(isAuth, getAllPost)
  .post(isAuth, upload.array('media'), createPost);

router
  .route('/:id')
  .patch(isAuth, upload.array('media'), updatePost)
  .delete(isAuth, deletePost);

router.patch('/:id/like', isAuth, likePost);
router.patch('/:id/unlike', isAuth, unlikePost);

module.exports = router;

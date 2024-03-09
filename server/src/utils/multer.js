const multer = require('multer');
const path = require('path');
const AppError = require('./appError');

const storage = multer.diskStorage({});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image ! please upload a image', 400), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

module.exports = upload;

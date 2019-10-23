const {Router} = require('express');
const path = require('path');
const multer = require('multer');
const imageProcessor = require('./imageProcessor');

const router = Router();

const filename = (req, file, callback) => callback(null, file.originalname);

const photoPath = path.resolve(__dirname, '../../client/photo-viewer.html');

const fileFilter = (req, file, callback) => {
  if ( file.mimetype !== 'image/png' ) {
    req.fileValidationError = 'Wrong file type';
    callback(null, false, new Error('Wrong file type'));
  } else {
    callback(null, true);
  }
};

const storage = multer.diskStorage({destination: 'api/uploads/', filename});

const upload = multer({
  limits: {filesize: 10000},
  fileFilter,
  storage,
});

router.post('/upload', upload.single('photo'), async (req, res) => {
  if ( req.fileValidationError ) {
    return res.status(400).json({error: req.fileValidationError});
  }

  await imageProcessor(req.file.filename);

  return res.status(201).json({success: true});
});

router.get('/photo-viewer', (req, res) => {
  res.sendFile(photoPath);
});

module.exports = router;

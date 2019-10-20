const { Router } = require('express') // module 2
const multer = require('multer') // module 2
const path = require('path') // module 2

const imageProcessor = require('./imageProcessor') // module 4

const router = Router() // module 2

const filename = (req, file, callback) => {
    callback(null, file.originalname)
  }

const storage = multer.diskStorage({
  destination: 'api/uploads/',
  filename
}) // module 2

const fileFilter = (req, file, callback) => {
  if (file.mimetype !== 'image/png') {
    req.fileValidationError = 'Wrong file type'
    return callback(null, false, new Error('Wrong file type'))
  } else {
    callback(null, true)
  }
}

const photoPath = path.resolve(__dirname, '../../client/photo-viewer.html')

const upload = multer({
  storage,
  limits: { filesize: 10000 },
  fileFilter
}) // module 2

router.post('/upload', upload.single('photo'), async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError})
  }

  await imageProcessor(req.file.filename)


  return res.status(201).json({ success: true })
}) // module 2

router.get('/photo-viewer', (req, res) => {
  res.sendFile(photoPath)
}) // module 3

module.exports = router // module 2

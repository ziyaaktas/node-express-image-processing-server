const { Router } = require("express")
const { diskStorage } = require("multer")

const router = Router()

const filename = (request, file, callback) => {
  callback(null, file.originalname)
}

const storage = diskStorage({ destination: "api/uploads/", filename })

function fileFilter(request, file, callback) {
  const errorMessage = "Wrong file type"
  if (file.mimetype != "image/png") {
    request.fileValidationError = errorMessage
    callback(null, false, new Error(errorMessage))
  } else {
    callback(null, true)
  }
}

const upload = require("multer")({ fileFilter, storage })
router.post("/upload", upload.single("photo"), (request, response) => {
  if (request.fileValidationError) {
    response.status(400).json({ error: request.fileValidationError })
  }
  response.status(201).json({ success: true })
})

module.exports = router

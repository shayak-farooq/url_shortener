const userController = require('../controller/userController')
const multer  = require('multer')
// const upload = multer({ dest: './uploads' })
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, Date.now()+ file.originalname )
  }
})
const upload = multer({ storage: storage })

const express = require('express');
router = express.Router()

router.post('/',upload.single('profile'),userController.signUp)
router.post('/login',userController.handleUserLogin)
router.post('/forgetpassword',userController.handleforgetpassword)
router.post('/verifyotp',userController.handleVerifyotp)
router.post('/resetpassword',userController.handleResetPassword)

module.exports = router
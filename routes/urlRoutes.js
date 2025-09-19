const express = require('express');
const urlController = require('../controller/urlController')

router = express.Router()

router.post('/', urlController.createShortUrl )
router.get('/:id', urlController.redirectUrl )

module.exports = router
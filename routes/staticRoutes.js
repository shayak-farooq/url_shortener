const express = require('express');
const URL = require('../model/urlModel')
const {restrictedTo} = require("../middlewares/auth")

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        if (!req.user) { 
            return res.redirect('/login')
        }
        const allUrls = await URL.find({ createdBy:req.user._id })
        return res.render('home', {
            url: allUrls
        })
    } catch (error) {
        console.error('Error fetching URLs:', error)
        return res.status(500).json({
            message: 'Error fetching URLs',
            error: error.message
        })
    }
})
router.get('/admin/urls',restrictedTo(['ADMIN']),async (req, res) => {
    try {
        if (!req.user) { 
            return res.redirect('/login')
        }            
        const allUrls = await URL.find({ })
        return res.render('home', {
            url: allUrls
        })
    } catch (error) {
        console.error('Error fetching URLs:', error)
        return res.status(500).json({
            message: 'Error fetching URLs',
            error: error.message
        })
    }
})
router.get('/signup', (req, res) => {
    return res.render('signup')
})
router.get('/login', (req, res) => {
    return res.render('login')
})
router.get('/forgetpassword', (req, res) => {
    return res.render('forgetpassword')
})


module.exports = router
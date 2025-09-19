const Url = require('../model/urlModel')
const { nanoid } = require('nanoid');

exports.createShortUrl = async ( req , res ) => {
    try{
        const { url } = req.body
        const shortId = nanoid(6) //6 --> length of shortid
        await Url.create({ originalUrl : url, createdBy:req.user._id , shortId : shortId})
        // res.status(200).json({data:urls})
        const allUrls = await Url.find({createdBy:req.user._id})
        res.render('home',{shortId , url:allUrls} )

    }
    catch(error){
        console.error('Error creating short url :',error)
        res.status(500).send('Internal Server Error')
    }
}
exports.redirectUrl = async ( req , res ) => {
    try {
        const shortId = req.params.id
        const redirectUrl = await Url.findOne({shortId})
        if(redirectUrl){
            res.redirect(redirectUrl.originalUrl)
        }
        else{
            res.status(404).send('URL not found');
        }
    } catch (error) {
        console.error('Error redirecting:',error)
        res.status(500).send('Server Error');
    }
}
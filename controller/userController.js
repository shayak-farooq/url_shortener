const User = require('../model/usermodel')
const { setUser } = require('../service/auth')
const bcrypt = require('bcryptjs')
const nodemailer = require("nodemailer");


exports.signUp = async (req, res) => {
    try {
        console.log(req.body)
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(req.body.password, salt);
        // console.log(salt,password)
        const { name, email, userName } = req.body
        const profile = req.file.filename
        if (!userName || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        await User.create({ name, email, userName, password, profile })
        res.redirect('/')
    }
    catch (err) {

        console.error('Error creating user', err)
    }
}

exports.handleUserLogin = async (req, res) => {
    try {


        const { userName, password } = req.body
        const user = await User.findOne({ userName })

        if (!user || !bcrypt.compareSync(password, user.password)) {

            console.log('userController: user not found')
            return res.render('login', { error: " Invalid Username or Password" })
        }
        const token = setUser(user)
        res.cookie('uid', token)
        return res.redirect('/')
        // return res.json({token})

    }
    catch (error) {
        console.log("error login", error)
        res.status(500)
    }
}
exports.handleforgetpassword = async (req, res) => {
    try {

        const { email } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            console.log('userController:email not found')
            return res.render('forgetpassword', { error: " Invalid Email" })
        }
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        
        (async () => {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "OTP for password reset",
                text: `your otp is 1234`, // plain‑text body
            });

            console.log("Message sent:", info.messageId);
        })();
        return res.render('verifyotp')

    }
    catch (error) {
        console.log("error login", error)
        res.status(500)
    }
}
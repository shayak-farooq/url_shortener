const User = require('../model/usermodel')
const { setUser } = require('../service/auth')
const bcrypt = require('bcryptjs')
const nodemailer = require("nodemailer");
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken')
// const Redis = require('ioredis');
// const redis = new Redis();
const logger = require('../service/winstonLogger');
const { error } = require('winston');

function generateOTP() {
    return Math.floor(1000 + Math.random() * 900000).toString()
}

exports.signUp = async (req, res) => {
    try {
        // console.log(req.body)
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(req.body.password, salt);
        // console.log(salt,password)
        const { name, email, userName } = req.body
        const existingUser = await User.find({ $or: [{ email }, { userName }] })
        if (existingUser.length > 0) {
            return res.render('signup', { error: "Email or username already exists" })
        }
        const profile = req.file.filename
        if (!userName || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        // await User.create({ name, email, userName, password, profile })
        let OTP = generateOTP();
        console.log(OTP)
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
                subject: "OTP for Signup",
                text: `your OTP is ${OTP}.\nplease Do not share it with anyone`, // plain‑text body
            });

            console.log("Message sent:", info.messageId);
        })();

        let hashedOTP = bcrypt.hashSync(OTP, 10);
        let authToken = jwt.sign({
            hashedOTP,
            email,
            password,
            profile,
            userName,
            name
        }, process.env.JWT_SECRET,
            { expiresIn: '10m' })
        // await redis.set(`otp:${email}`, OTP, 'EX', 600);
        // await redis.set(`password:${email}`, password, 'EX', 600);
        // await redis.set(`profile:${email}`, profile, 'EX', 600);
        // await redis.set(`userName:${email}`, userName, 'EX', 600);
        // await redis.set(`name:${email}`, name, 'EX', 600);

        // res.redirect('/')
        return res.render('VerifySignupOtp', { authToken: authToken })
    }
    catch (err) {
        logger.error('error during signup' + err)
        console.error('Error creating user', err)
        return res.status(500).json({
            error: "Internal server error. Please try again later"
        })
    }
}

exports.verifySignupOtp = async (req, res) => {
    try {
        const { authToken, userOtp } = req.body
        // const storedOtp = await redis.get(`otp:${email}`);'
        if (!userOtp || !authToken) {
            return res.render('VerifySignupOtp', { error: "Otp required", authToken: authToken })
        }

        let decodeToken;
        try {
            decodeToken = jwt.verify(authToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.render("VerifySignupOtp", {
                authToken: authToken,
                error: "Invalid or expired token"
            })
        }
        const isOtpValid = bcrypt.compareSync(userOtp, decodeToken.hashedOTP)
        
        if (!isOtpValid) {
            return res.render("VerifySignupOtp", {
                authToken: authToken,
                error: "Invalid OTP"
            });
        }
        console.log(isOtpValid)
        // const password = await redis.get(`password:${email}`);
        // const profile = await redis.get(`profile:${email}`);
        // const userName = await redis.get(`userName:${email}`);
        // const name = await redis.get(`name:${email}`);

        await User.create({
            name: decodeToken.name,
            email: decodeToken.email,
            userName: decodeToken.userName,
            password: decodeToken.password,
            profile: decodeToken.password
        })

        return res.redirect('/')
    } catch (error) {
        logger.error('error during signup otp validation' + error)
        // console.log(error)
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
            return res.render('forgetpassword', { error: " Invalid Email" })
        }
        let OTP = generateOTP();
        console.log(OTP)
        let expire = Date.now() + 10 * 60 * 1000
        user.passwordResetToken = OTP
        user.passwordResetExpires = expire
        await user.save()
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
                text: `your OTP is ${OTP}.\n Do not `, // plain‑text body
            });

            console.log("Message sent:", info.messageId);
        })();
        // return res.render('forgetpassword',{otpsent:true})
        return res.render('verifyotp', { email: user.email })
    }
    catch (error) {
        console.log("error login", error)
        res.status(500)
    }
}

exports.handleVerifyotp = async (req, res) => {
    try {
        const { otp, email } = req.body
        if (!otp || !email) {
            return res.render('verifyotp', {
                error: "OTP required"
            })
        }
        const user = await User.findOne({ email, passwordResetToken: otp, passwordResetExpires: { $gt: Date.now() } })
        if (!user) {
            return res.render('verifyotp', {
                error: "Invalid OTP or OTP Expired"
            })
        }
        const authToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        )
        return res.render('resetpassword', { authToken: authToken })
    } catch (error) {
        console.log(error)
    }
}
exports.handleResetPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword, authToken } = req.body
        if (!newPassword || !confirmPassword || !authToken) {
            return res.render('resetpassword', {
                error: "Password not entired"
            })
        }
        if (newPassword !== confirmPassword) {
            return res.render('restpassword', {
                error: "password and confirm password not same"
            })
        }
        let decodeToken;
        try {
            decodeToken = jwt.verify(authToken, process.env.JWT_SECRET)
        } catch (error) {
            return res.render('restpassword', {
                error: "invalid or expired token"
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(newPassword, salt);

        await User.findOneAndUpdate({ _id: decodeToken.id }, { password: password })

        return res.render('login', {
            message: "Password updated successfully"
        })
    } catch (error) {
        console.log(error)
    }
}
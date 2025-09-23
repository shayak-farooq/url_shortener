const User = require('../model/usermodel')
const { setUser } = require('../service/auth')
const bcrypt = require('bcryptjs')
const nodemailer = require("nodemailer");
let store = {
    OTP :null,
    email:null
}
function generateOTP(){
    return Math.floor(1000 + Math.random()* 900000).toString()
}

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
            return res.render('forgetpassword', { error: " Invalid Email" })
        }
        let OTP= generateOTP();
        store ={OTP,email}

        console.log(store)
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
                text: `your otp is ${OTP}`, // plain‑text body
            });

            console.log("Message sent:", info.messageId);
        })();
        // return res.render('forgetpassword',{otpsent:true})
        return res.render('verifyotp')  
    }
    catch (error) {
        console.log("error login", error)
        res.status(500)
    }
}

exports.handleVerifyotp = async (req, res) => {
    try {
        const {otp} = req.body
        if(!otp){
            return res.render('verifyotp',{
                error:"OTP required"
            })
        }
        if(otp !== store.OTP){
            return res.render('verifyotp',{
                error:"Invalid OTP"
            })
        }

        return res.render('resetpassword')
    } catch (error) {
        console.log(error)
    }
}
exports.handleResetPassword = async (req, res) => {
    try {
        const { newPassword,confirmPassword} = req.body
        if(!newPassword || !confirmPassword){
            return res.render('resetpassword',{
                error:"Password not entired"
            })
        }
        if(newPassword !== confirmPassword){
            return res.render('restpassword',{
                error:"password and confirm password not same"
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(newPassword, salt);

        const email = store.email
        await User.findOneAndUpdate({ email },{password:password})

        return res.render('login',{
            message:"password updated successfully"
        })
    } catch (error) {
        console.log(error)
    }
}
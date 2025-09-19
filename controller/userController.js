const User = require('../model/usermodel')
const {setUser} = require('../service/auth')
const bcrypt = require('bcryptjs')


exports.signUp = async( req , res ) => {
    try{
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(req.body.password , salt);
        // console.log(salt,password)
        const {name,email,userName } = req.body
        const profile = req.file.filename  
        if(!userName|| !password ||!email ){
            return res.status(400).json({error:'All fields are required'})
        }

        await User.create({name,email,userName,password,profile})
        res.redirect('/')
    }
    catch(err){
        
        console.error('Error creating user',err)
    }
}

exports.handleUserLogin = async ( req , res ) => {
    try{
        

        const { userName , password } = req.body
        const user = await User.findOne({ userName })
        
        if(!user || !bcrypt.compareSync(password, user.password )){

            console.log('userController: user not found')
            return res.render('login',{error:" Invalid Username or Password"})
        }
        const token = setUser(user)
        res.cookie('uid',token)
        return res.redirect('/')
        // return res.json({token})

    }
    catch(error){
        console.log("error login",error)
        res.status(500)
    }
}
exports.handleforgetpassword = async ( req , res ) => {
    try{
        const salt = bcrypt.genSaltSync(10);
        const newPassword = bcrypt.hashSync(req.body.newPassword , salt);

        const { userName } = req.body
        const user = await User.findOneAndUpdate({ userName }, {password:newPassword }, { new: true })
    
        if(!user){
            console.log('userController: user not found')
            return res.render('forgetpassword',{error:" Invalid Username"})
        }
        
        return res.redirect('/login')

    }
    catch(error){
        console.log("error login",error)
        res.status(500)
    }
}
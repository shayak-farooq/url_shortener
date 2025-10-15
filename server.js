const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const urlRoutes = require('./routes/urlRoutes');
const userRoutes = require('./routes/userRoute');
const staticRoutes = require('./routes/staticRoutes');
const {restrictToLoggedUserOnly,checkAuth} = require('./middlewares/auth')

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI;

if(!MONGO_URI){
    console.error('MONGO_URI missing from .env')
    process.exit(1)
}
mongoose.connect(MONGO_URI)
.then(() => console.log('Connected to Mongodb'))
.catch(err=>{
    console.error("Mongodb connection error:",err)
    process.exit(1)
})

app.set('view engine', 'ejs') 
app.set('views',path.resolve('./views') ) 
app.use(express.json())
app.use(express.urlencoded( {extended:true }))
app.use(cookieParser())
app.use(checkAuth);
app.use(cors())

app.use('/user',userRoutes)
app.use('/url',restrictToLoggedUserOnly,urlRoutes)
app.use('/',staticRoutes)
app.use('/event',( req , res ) => {
    console.log(req.body)
    return res.status(200).json("Successfull")
})


app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`)
})
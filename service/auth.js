const jwt = require('jsonwebtoken')
const secret = "Ilssrinagar1234"

function setUser(user){
    return jwt.sign({
        _id:user._id,
        userName:user.userName,
        role:user.role
    },secret)
}
function getUser(token){
    if(!token) return null;
    try {
        return jwt.verify(token,secret)
        
    } catch (error) {
        return null
    }
}

module.exports = { setUser,getUser }
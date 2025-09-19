// const { getUser } = require('../service/auth')
// async function restrictToLoggedUserOnly(req, res, next) {

//     const userUid = req.headers['authorization']
//     if (!userUid) return res.redirect('/login')

//     const token = userUid.split("Bearer ")[1]
//     if(!token) return res.redirect('/login')

//     const user = getUser(token)
//     if (!user) return res.redirect('/login')

//     req.user = user;
//     next();

// }
// async function checkAuth(req, res, next) {
//     const token = req.headers['authorization'].split("Bearer ")[1]
//     if (!token){
//         // console.log("middleware: userUid not found")
//         req.user = null
//         return next()
//     }
//     // const token = userUid.split("Bearer ")[1]
//     // if (!token){
//     //     // console.log("middleware: token not found")
//     //     req.user = null
//     //     return next()
//     // }
//     const user = getUser(token)
//     req.user = user
//     next()
// }

// module.exports = { restrictToLoggedUserOnly, checkAuth }


const { getUser } = require('../service/auth')

async function restrictToLoggedUserOnly(req, res, next) {
    const userUid = req.cookies?.uid
    if (!userUid) return res.redirect('/login')

    const user = getUser(userUid)
    if (!user) return res.redirect('/login')

    req.user = user;
    next();

}
async function checkAuth(req, res, next) {
    const userUid = req.cookies?.uid
    const user = getUser(userUid)
    req.user = user
    next()
}
function restrictedTo(roles) {
    return (req, res, next) => {
        if (!req.user) return res.redirect('/login')
        if (!roles.includes(req.user.role)) {            
            return res.end('unauthorized')
        }
        next()
    }
}
module.exports = { restrictToLoggedUserOnly, checkAuth, restrictedTo }
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const auth = async (req, res, next) => {
    try{
        // Get token from brower's cookie 
        const token = req.cookies.token || "";

        // Verify token with secret key 
        const decoded = jwt.verify(token, "thisisHMS");

        // Find user with _id and token
        const user = await Admin.findOne({_id: decoded._id, 'tokens.token' : token });

        // Not Found
            if(!user) {
                throw new Error();
            }
            
            req.token = token;
            req.user = user;
            next();

    } catch{
        req.flash('msg', "Please login");
        res.redirect('/admin/login');
    }
}

module.exports = auth;
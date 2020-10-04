const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const auth = async (req, res, next) => {
    try{
        const token = req.cookies.token || "";
        const decoded = jwt.verify(token, "thisisHMS");
        const user = await Admin.findOne({_id: decoded._id, 'tokens.token' : token });

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
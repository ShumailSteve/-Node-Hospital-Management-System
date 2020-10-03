const express = require('express');
const router = new express.Router();

const Admin = require('../models/admin');

const auth = require('../middleware/auth');


//Get admins list
router.get('', async (req, res) => {
    try{
            const admins = await Admin.find({});
            const len = admins.length;

            if (!len) {
                      return res.status(404).send("No");
            }
            res.send(admins);
    } catch (e) {
            res.status(404).send();
    }
});


//Register Admin
router.get('/register', (req, res) => {
    res.render('admins/register');
});


//Admin Login Page
router.get('/login', (req, res) => {
         res.render('admins/login', {info_msg: req.flash('msg')});
});


//Get Forget-pass Page
router.get('/forgot-password', (req, res) => {
    res.render('admins/forgot-password');
});

//Get Change-pass Page
router.get('/change-password', (req, res) => {
    res.render('admins/change-password');
});




// Add admin
router.post('/register', async (req, res) => {
            try{     
              // Obj Destructuring            
                const {username, email, password1, password2, phone} = req.body;
              
                let errors = [];
                // If any required field in empty
                if(!username || !email || !password1 || !password2 || !phone) {
                    errors.push({msg: 'Please fill all required fields'});
                    return res.render('admins/register', { errors, username, email, phone});
                }

                // If password and confirm password does not match
                if(password1 != password2) {
                    errors.push({msg: 'Password does not match'});
                    return res.render('admins/register', { errors, username, email, phone});
                }

                //Create new admin
                const newAdmin = new Admin({username, email, password: password1, phone});
                
                //Save admin to db
                await newAdmin.save();

                // Redirect to admin login page 
                req.flash('msg', "Registered Successlly, you can now login");
                res.redirect('/admin/login');
                } 
                
                catch (e) {
                    // If email to register already exists in db
                    if(e.keyValue.email) {
                        res.render('admins/register', {info_msg: `${e.keyValue.email} already exists`})
                        return;
                    }
                        // Internal Server Error
                        res.render('error-500');
                }
});

// Admin Login
router.post('/login', async (req, res) => {
            // Object destructuring
            const {email, password} = req.body;
            let errors = [];

            if(!email || !password) {
                errors.push({msg: "Please fill all required fields"});
                // return res.render('admins/login', {errors})
                return res.send("NOT")
            }
            try{
                    const user = await Admin.findByCredentials(email, password);
                    const token = await user.generateAuthToken();

                    // Save token as a cookie in browser
                    res.cookie('token', token, {
                        expires: new Date(Date.now() + 300000),
                        secure: false, // set to true if your using https
                        httpOnly: true,
                      });
                      res.redirect('/index');
                
            } catch (e) {
                res.render('admins/login', {info_msg: e})
                return;
            }
 });

 //logout user
router.get('/logout', auth, async (req,res) => {
        console.log("logout");
        console.log(req.user);
            try{
                    // Delete the current token 
                    req.user.tokens = req.user.tokens.filter( (token) => {
                        return token.token != req.token;
                    });

                    await req.user.save();
                    res.redirect('/index');

            } catch (e) {
                    console.log(e);
            }
    });
        
    


module.exports = router;
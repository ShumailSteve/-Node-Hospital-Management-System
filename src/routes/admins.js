const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');

const admin = require('../models/admin');

//Get Login Page
router.get('/login', (req, res) => {
    res.render('admins/login');
});

//Get Register Page
router.get('/register', (req, res) => {
    res.render('admins/register');
});

//Get Forget-pass Page
router.get('/forgot-password', (req, res) => {
    res.render('admins/forgot-password');
});

//Get Change-pass Page
router.get('/change-password', (req, res) => {
    res.render('admins/change-password');
});




//Get admins list
router.get('/', async (req, res) => {
    try{
            const admins = await admin.find({});
            const len = admins.length;

            if (!len) {
                      return res.status(404).send();
            }
            res.send(admins);
    } catch (e) {
            res.status(404).send();
    }
});

// Add admin
router.post('/register', async (req, res) => {
    try{     
         // Obj Destructuring            
        const {username, email, password, password2, phone} = req.body;
        if(password != password2){
            return res.status(400).send("Pass mismatch");
        }
        //Hash Pass before saving to db
        const hashedPass = await bcrypt.hash(password, 8);
        const newAdmin = new admin({username, email, password: hashedPass, phone});        
        await newAdmin.save();
        // Created
        res.status(201).send();
} catch (e) {
        // Bad request
        res.status(400).send(e);
}
});

// Admin Login
router.post('/login', async (req, res) => {
        try{
               
                var doc;
                if(req.body.email)
                {
                   doc =  await admin.findOne({email: req.body.email});
                }
                else {
                     doc =  await admin.findOne({username: req.body.username});  
                }
                
            if (!doc)  {
                    //status 404 = Not Found
                return res.status(404).send("email doesn't exists");
            }
            const isMatch = await bcrypt.compare(req.body.password, doc.password);
            // If pass doesn't match
            if(!isMatch){
                return res.status(400).send("Incorrect Pass");
            }
           res.send(doc.username);
        } catch (e) {
            // Bad Request
            res.status(400).send(e);
        }
     
    });
    


module.exports = router;
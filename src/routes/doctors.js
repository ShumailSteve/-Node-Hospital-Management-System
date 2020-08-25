const express = require('express');
const path = require('path');
const fs = require('fs');
const router = new express.Router();
const doctor = require('../models/doctor');
const multer = require('multer');

// FOR DELETING USING href
router.use( function( req, res, next ) {
   // if _method exists then set req.method 
    if ( req.query._method == 'DELETE' ) {
        // change the original method to DELETE Method
        req.method = 'DELETE';
        // and set requested url to /user/12
        req.url = req.path;
    }       
    next(); 
});

// Set Storage for Image
var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/assets/img/');
        },
        filename: function (req, file, cb) {
            cb(null,  'Doctor-' + Date.now() + '.jpg' );
        }
});

var upload = multer({storage: storage});

// Get Add Doctor Page
router.get('/add-doctor', (req, res) => {
    res.render('doctors/add-doctor');
});

 // Edit Doctor by ID
 router.get('/edit-doctor/:id', async (req, res) => {
     const doc = await doctor.findById(req.params.id);   
     res.render('doctors/edit-doctor', {doc});
});

//Get all Doctors 
router.get('', async (req, res) => {
        try{
            const doctors = await doctor.find({});
            const len = doctors.length;
            // If no doctors
            if (!len) {                   
                    return res.render('doctors/doctors', {info_msg: "No doctors available"});                   
            }
            res.render('doctors/doctors', {doctors, success_msg: req.flash('msg')});            
        } catch (e) {
            // Internal Server Error
            res.status(500).render('error-500');
        }
});

// Get Single Doctor by ID
router.get('/profile/:id', async (req, res) => {
            try {
                const doc = await doctor.findById(req.params.id);
              // Not Found
              if (!doc) {                 
                return res.status(404).render('error-404');
            }
            //    res.send(doc);
            res.render('doctors/profile', {doc, success_msg: req.flash('msg')});
            } catch (e) {
                // Internal Server Error
                res.status(400).render('error-500');
            } 
});

// Add Doctor
router.post('/add-doctor', upload.single('img'), async (req, res) => {
    try{
         let errors = [];
         const {firstName, lastName, email, department, DOB, gender, address, city, phone, joiningDate, educationDetails, status } = req.body;
        // If any required field is missing
        if(!firstName || !email || !DOB || !address || !city || !phone){
            errors.push({msg: 'Please Fill all required fields'});   
            // Send entered data back to client   
            res.render('doctors/add-doctor', {
                errors,
                firstName, lastName, email, department, DOB, gender, address, city, phone, joiningDate, educationDetails, status
            });
              // Delete File from img Folder
            if(req.file) {
                fs.unlink(req.file.path, (e) => {
                    if (e)  return console.log(e);
                console.log("File Deleted");
                } );          
            }   
           
            return;
        }
         // Check if doctor with given Email already exists
        const docEmail = await doctor.find({email});
        // If yes 
        if(docEmail.length != 0){
            errors.push({msg: 'Email already exists'});
            res.render('doctors/add-doctor', {
                errors,
                firstName, lastName, email, department, DOB, gender, address, city, phone, joiningDate, educationDetails, status
            });
            if(req.file) {
                fs.unlink(req.file.path, (e) => {
                    if (e)  return console.log(e);
                console.log("File Deleted");
                } );          
            }   
            return;
        }
           let img;
        // If picture has been uploaded
        if(req.file){
            const f = fs.readFileSync(req.file.path, 'base64');

            img = f;
            // Delete File from img Folder
            fs.unlink(req.file.path, (e) => {
                if (e)  return console.log(e);
            console.log("File Deleted");
            })       
         }
    
        const doc = await doctor.find({});
        // For Generating Auto-incremental id
        const len = doc.length+1;
        const newDoctor = new doctor({id: len, firstName, lastName, email, department, DOB, gender, address, city, phone, joiningDate,  img, educationDetails, status });
        await newDoctor.save();
        req.flash('msg', 'New Doctor added, kindly add schedule');
        res.redirect(`/doctors/add-schedule/${newDoctor._id}`);
       
        }
        catch (e) {
            // Internal Server Error
            res.status(500).render('error-500');
       }
 });

 // Edit Doctor
router.patch('/:id', upload.single('img') , async (req, res) => {
            //Obj Destructuring
            const {firstName, lastName, email, department, DOB, gender, address, city, phone, joiningDate, educationDetails, status } = req.body;

            const updates = Object.keys(req.body);

            // List of allowed updates
            const allowedUpdates = ['firstName', 'lastName', 'email', 'department', 'DOB', 'gender', 'address', 'city', 'phone',
                                    'joiningDate', 'educationDetails', 'status' ];
            
            // Check if all updates are allowed
            const isValidOperation = updates.every( (update) => 
                                    allowedUpdates.includes(update));
            
            // If any invalid update exists return error                        
            if (!isValidOperation) {
                   // Delete File from img Folder
                   fs.unlink(req.file.path, (e) => {
                    if (e)  return console.log(e);
                    console.log("File Deleted");
                })    
                return res.render('error-404');
            }
              let img;
            // If picture has been uploaded
            if(req.file){
                const f = fs.readFileSync(req.file.path, 'base64');
               
                img = f;
                // Delete File from img Folder
                fs.unlink(req.file.path, (e) => {
                    if (e)  return console.log(e);
                console.log("File Deleted");
                })       
            }  
          try{                       
            const doc =  await doctor.findById(req.params.id);
               // Not Found
                if (!doc) {                 
                    return res.status(404).render('error-404');
                }
            // Update Doctor
            doc.firstName = firstName;
            doc.lastName = lastName;
            doc.email = email;
            doc.department = department; 
            doc.DOB = DOB;
            doc.gender = gender; 
            doc.address = address; 
            doc.city = city;
            doc.phone = phone; 
            doc.joiningDate = joiningDate;
            doc.educationDetails = educationDetails; 
            // Update only if new picture uploaded
            if(img != undefined)
                doc.img = img;
            doc.status = status;

            // Save updates
            await doc.save();   
            req.flash('msg', 'Updates Successfully');         
            res.redirect(`/doctors/profile/${doc._id}`);
    }
    catch (e) {
        // Internal Server Error
        res.status(500).render('error-500');
    }
});

// Delete Single Doc
router.delete('/:id', async (req, res) => {
        try {
               // Get num of account being deleted
                const doc = await doctor.findById(req.params.id);
               
                // If no doctors
                if (!doc)
                    {
                       return res.render('doctors', {info_msg: "No doctors available"});
                    }
                const docNum = doc.id;
               
                // Delete Account
                await doctor.findByIdAndDelete(req.params.id);                

                // Decrement nums by one of all accounts below deleted account
                await doctor.updateMany({"id" : {$gt: docNum}}, {$inc: {id: -1}});
                
                // Status 410 = Deleted
                req.flash('msg', 'Doctor deleted successfully');
                res.redirect('/doctors');
            } catch (e) {
                // Internal Server Error
            res.status(500).render('error-500');
        }
 });

 // Delete All (Promise)
router.delete('/', (req, res) => {    
    doctor.deleteMany().then( (doc) =>  {     
        // if no doctors availab
        if (doc.deletedCount == 0)        {
            // Not Found
            return res.status(404).send("No doctors are present in db");
        }
        // Gone 
        res.status(410).send('All Deleted')
     } )
     // Internal Server Error
    .catch (e => res.status(500).send(e)); 
 });

//SCHEDULES

// All Docs Schedules
router.get('/schedules', async (req, res) => {
        // Get all doctors
        try {
            const docs = await doctor.find({});
          // If no doctors 
            if(docs.length == 0){
                    return res.render('doctors/schedules', {info_msg: "No doctors available currently"});
            }
            res.render('doctors/schedules', {docs});
        } catch (e) {
            // Internal Server Error
            res.status(500).render('error-500');
       }  
});

// Add Schedule by Doc _id
router.get('/add-schedule/:id', async(req, res) => {
            try{
                const doc = await doctor.findById(req.params.id);
                var name = doc.lastName + ',' + doc.firstName;
                res.render('doctors/add-schedule', {id: doc._id, name, success_msg: req.flash('msg')} );
            }catch(e) {
                // Not Found
                res.render('error-404');
            }    
});

// Add Schdule of Doc 
router.post('/add-schedule/:id', async (req, res) => {
            try{
                const doc = await doctor.findById(req.params.id);
                // If not Found
                if(!doc) {
                    return res.render('error-404');
                }

                // Convert availableDays to String
                var availableDaysString = JSON.stringify(req.body.availableDays);
                doc.availableDays = availableDaysString;
                doc.availableFrom = req.body.availableFrom;
                doc.availableTill = req.body.availableTill;
                await doc.save();
                req.flash('msg', 'Schedule added successfully');
                res.redirect(`/doctors/profile/${doc._id}`);
            } catch (e) {
                    res.render('error-500');
            }  
});

// Get Edit Schedule 
router.get('/edit-schedule/:id', async (req, res) => {
            try{
                // Get doctor by ID
                const doc = await doctor.findById(req.params.id);
                // If not Found
                if(!doc) {
                    return res.render('error-404');
                }                
                const {firstName, lastName, availableDays, availableFrom, availableTill} = doc;
                var name = doc.lastName + ',' + doc.firstName;
                res.render('doctors/edit-schedule', {id: req.params.id, name, availableDays, availableFrom, availableTill});
            } catch (e) {
                // Internal Server Error
                res.render('error-500');
            }            
});

// Edit Schedule
router.patch('/edit-schedule/:id', async (req, res) => {
            try{
                 // Get doctor by ID
                 const doc = await doctor.findById(req.params.id);
                 // If not Found
                 if(!doc) {
                     return res.render('error-404');
                 }  
                doc.availableDays = JSON.stringify(req.body.availableDays);
                doc.availableFrom = req.body.availableFrom;
                doc.availableTill = req.body.availableTill;
                await doc.save();
                req.flash('msg', 'Schedule Updated Successfully');
                res.redirect(`/doctors/profile/${doc._id}`);
            } catch (e) {
                // Internal Server Error
                res.render('error-500');
            }        
});

module.exports = router;
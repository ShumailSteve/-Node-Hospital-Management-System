const express = require('express');
const path = require('path');
const fs = require('fs');
const router = new express.Router();
const doctor = require('../models/doctor');
const multer = require('multer');

// FOR DELETING USING HREF
router.use( function( req, res, next ) {
    // this middleware will call for each requested
    // and we checked for the requested query properties
    // if _method was existed
    // then we know, clients need to call DELETE request instead
    if ( req.query._method == 'DELETE' ) {
        // change the original METHOD
        // into DELETE method
        req.method = 'DELETE';
        // and set requested url to /user/12
        req.url = req.path;
    }       
    next(); 
});
// router.use( function( req, res, next ) {
//     // this middleware will call for each requested
//     // and we checked for the requested query properties
//     // if _method was existed
//     // then we know, clients need to call DELETE request instead
//     if ( req.query._method == 'PATCH' ) {
//         // change the original METHOD
//         // into DELETE method
//         req.method = 'PATCH';
//         // and set requested url to /user/12
//         req.url = req.path;
//     }       
//     next(); 
// });



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

 // Get Edit Doc Page
 router.get('/edit-doctor/:id', async (req, res) => {
     const doc = await doctor.findById(req.params.id);
   
    res.render('doctors/edit-doctor', {doc});
});



//Get all Doctors 
router.get('', async (req, res) => {
    try{
        const doctors = await doctor.find({});
         const len = doctors.length;

         if (!len) {
                   
                   return res.render('doctors/doctors');
                   
         }
            // status 200 = successful
        // res.status(200).send({doctors, len});
          res.render('doctors/doctors', {doctors, success_msg: req.flash('msg')});
        
    } catch (e) {
        // Internal Server Error
        res.status(500).send(e);
    }
});


// Get Single Doctor by ID
router.get('/profile/:id', async (req, res) => {
    try {
        const doc = await doctor.findById(req.params.id);
        if (!doc)  {
                //status 404 = Not Found
            return res.status(404).send("This doctor doesn't exists ");
        }
    //    res.send(doc);
    res.render('doctors/profile', {doc});
    } catch (e) {
        // Bad Request
        res.status(400).send(e);
    }
    
});



// Add Doctor
router.post('/add-doctor', upload.single('img'), async (req, res) => {
    try{
         let errors = [];
        // Parse incoming Date 
        // const DOB = JSON.parse(req.body.DOB);
        // const joiningDate = JSON.parse(req.body.joiningDate);
        // DOB = new Date(DOB)

        //  Object Destructing 
        const {firstName, lastName, email, department, DOB, gender, address, city, phone, availableDays, availableFrom, availableTill, joiningDate, educationDetails, status } = req.body;
        // If any required field is missing
        if(!firstName || !email || !DOB || !address || !city || !phone){
            errors.push({msg: 'Please Fill all required fields'});
            // if(availableDays) {
            //     availableDays = JSON.parse(availableDays);
            // }
            res.render('add-doctor', {
                errors,
                firstName, lastName, email, department, DOB, gender, address, city, phone, availableDays, availableFrom, availableTill, joiningDate, educationDetails, status
            });
            return;
        }
              
        // If doctor with given Email already exists
        const docEmail = await doctor.find({email});
        if(docEmail.length != 0){
            errors.push({msg: 'Email already exists'});
            res.render('add-doctor', {
                errors,
                firstName, lastName, email, department, DOB, gender, address, city, phone, availableDays, availableFrom, availableTill, joiningDate, educationDetails, status
            });
            return;
        }
        var availableDaysString = JSON.stringify(req.body.availableDays);
        // var availableTime = availableFrom + ' - ' + availableTill;
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
        const newDoctor = new doctor({id: len, firstName, lastName, email, department, DOB, gender, address, city, phone, availableDays: availableDaysString, availableFrom, availableTill, joiningDate,  img, educationDetails, status });
        await newDoctor.save();
        req.flash('msg', 'New Doctor Added');
        res.redirect('/doctors');
       
        }
        catch (e) {
            // Internal Server Error
            res.status(500).send(e);
       }
 });

 // Edit Doctor
router.patch('/:id', upload.single('img') , async (req, res) => {
    //Obj Destructuring
    const {firstName, lastName, email, department, DOB, gender, address, city, phone, availableDays, availableFrom, availableTill, joiningDate, educationDetails, status } = req.body;

    // const updates = Object.keys(req.body);
           
    // const allowedUpdates = ['firstName', 'lastName', 'email', 'department', 'DOB', 'gender', 'address', 'city', 'phone',
    //                         'availableDays', 'availableFrom', 'availableTill', 'joiningDate', 'educationDetails', 'status' ];
                        
    // const isValidOperation = updates.every( (update) => 
    //                          allowedUpdates.includes(update));
    
    // if (!isValidOperation) {
    //     return res.status(400).send({error: 'Invalid Updates!'});
    // }
      // // Parse incoming Dates
         // If DOB update required
    //   if(req.body.DOB){
    //         const date = JSON.parse(req.body.DOB);
    //         req.body.DOB = date;
    //   }
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
          
            var availableDaysString = JSON.stringify(req.body.availableDays);
        
            doc =  await doctor.findById(req.params.id);
                if (!doc) {
                    // Not Found
                    return res.status(404).send("Doctor doesn't exists");
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
            doc.availableDays = availableDaysString; 
            doc.availableFrom = availableFrom; 
            doc.availableTill = availableTill; 
            doc.joiningDate = joiningDate;
            doc.educationDetails = educationDetails; 
            // Update only if new picture uploaded
            if(img != undefined)
                doc.img = img;
            doc.status = status;
            await doc.save();
            
            res.redirect(`/doctors/profile/${doc._id}`);
    }
    catch (e) {
        res.status(400).send(e);
    }
});



// Delete Single Doc
router.delete('/:id', async (req, res) => {
        try {
                let errors = [];
                let success_msg;
                // Get num of account being deleted
                const doc = await doctor.findById(req.params.id);
               
                if (!doc)
                    {
                        errors.push({msg : "This Doctor doesn't exists"});
                        // Not Found
                        return res.render('doctors', {errors});
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
            res.status(400).send(e);
        }
 });

 // Delete All (Promise)
router.delete('/', (req, res) => {
    
    doctor.deleteMany().then( (doc) =>  {
     
        // if db is empty
        if (doc.deletedCount == 0)
        {
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
router.get('/schedules', (req, res) => {
        res.render('doctors/schedules');
});

// Add Schedules
router.get('/schedules/add-schedule', (req, res) => {
    res.render('doctors/add-schedule');
});

// Edit Schedules
router.get('/schedules/edit-schedule', (req, res) => {
    res.render('doctors/edit-schedule');
});



module.exports = router;
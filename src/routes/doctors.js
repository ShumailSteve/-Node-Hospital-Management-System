const express = require('express');
const path = require('path');
const fs = require('fs');
const router = new express.Router();
const doctor = require('../models/doctor');
const department = require('../models/department');
const multer = require('multer');
const { time } = require('console');

// FOR DELETING USING href
router.use( function( req, res, next ) {
   // if _method exists then set req.method 
    if ( req.query._method == 'DELETE' ) {
        // change the original method to DELETE Method
        req.method = 'DELETE';
        // set requested url
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
        },
});

const imageMimeType = ['image/jpeg', 'image/png','image/gif'];
var upload = multer(
                 {storage: storage,
                  fileFilter: (req, file, cb) => {
                        cb(null, imageMimeType.includes(file.mimetype))
                    }
                 }
            );

// Get Add Doctor Page
router.get('/add-doctor', async (req, res) => {
                const departments = await department.find({});
                res.render('doctors/add-doctor', {departments});          
});

 // Edit Doctor by ID
 router.get('/edit-doctor/:id', async (req, res) => {
     try{
            const doc = await doctor.findById(req.params.id);
            // If no doctor exists
            if(!doc) {
                return res.redirect('/doctors');                
            }   
            const departments = await department.find({});
            res.render('doctors/edit-doctor', {doc, departments});
     } catch {
            // Internal Server Error
            res.render('error-500');
        }   
});

//Get all Doctors 
router.get('', async (req, res) => {
        let query = searchQuery(req);
        const url = "/doctors";
        try{
            const doctors = await query.exec();
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
                // If no doctor with given id
                if(!doc)  return res.status(400).render('error-404');
                res.render('doctors/profile', {doc, success_msg: req.flash('msg')});
            } catch {
                //Internal Server Error
                res.status(400).render('error-500');
            } 
});


// Get Docs by Department Name
router.get('/department', async (req, res) => {
    try {
        const doc = await doctor.find({department: req.query.department});
        // If no doctor with given id
        if(!doc)  return res.status(400).send("No Doctor");
        var docNames = [];
        var docIDs = [];
        // DB _id
        var doc_IDs = [];
        // push name of each doctor
        doc.forEach( doctor => { 
                            var fullname =  doctor.firstName+ " "+ doctor.lastName;
                            docNames.push(fullname);
                            docIDs.push(doctor.id);
                            doc_IDs.push(doctor._id);
      });
        res.send({docNames, docIDs, doc_IDs});
    } catch {
        //Internal Server Error
        res.send({Error: "Error"});
    } 
});

// Add Doctor
router.post('/add-doctor', upload.single('img'), async (req, res) => {
              // Assign Image to img and Delete
            const img = assignAndRemoveImage(req.file);
            const doc = await doctor.find({});
            // For Generating Auto-incremental id
            const len = doc.length+1;
            
            let newDoctor = new doctor({
                id: len,
                firstName: req.body.firstName,
                lastName : req.body.lastName,
                email : req.body.email,
                department: req.body.department, 
                DOB: req.body.DOB, 
                gender: req.body.gender, 
                address: req.body.address, 
                city: req.body.city, 
                phone: req.body.phone, 
                joiningDate: req.body.joiningDate, 
                educationDetails: req.body.educationDetails, 
                img: img,
                status: req.body.status
            });
            let errors = [];
            const departments = await department.find({});
            // If any required field is missing
            if(!newDoctor.firstName || !newDoctor.email ||  !newDoctor.department ||!newDoctor.DOB ||!newDoctor.gender || !newDoctor.address || !newDoctor.city || !newDoctor.phone || !newDoctor.status){
                errors.push({msg: 'Please Fill all required fields'});   
                // Send entered data back to client   
                res.render('doctors/add-doctor', {
                    errors,
                    doc: newDoctor,
                    departments
                });
                return;
            }
        try{ 
            await newDoctor.save();
            req.flash('msg', 'New Doctor added, kindly add schedule');
            res.redirect(`/doctors/add-schedule/${newDoctor._id}`);
         }  catch (e) {
                console.log(e);
          // If Email Already Exists
                if(e.keyPattern.email){
                            errors.push({msg: 'Email already exists'});
                                res.render('doctors/add-doctor', {
                                errors,
                                doc: newDoctor
                            });
                return;
                }
            //  Internal Server Error
            res.status(500).render('error-500');
       }
 });

 // Edit Doctor
router.patch('/:id', upload.single('img') , async (req, res) => {
              // Assign Image to img and Delete
              const img = assignAndRemoveImage(req.file);

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
                return res.render('error-404');
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
            res.render('doctors/schedules', {docs, success_msg: req.flash('msg')});
        } catch (e) {
            // Internal Server Error
            res.status(500).render('error-500');
       }  
});

// Get Doctor Schedule
router.get('/schedule', async (req, res) => {
    try {
        const doc = await doctor.findById(req.query.id);
        // If no doctor with given id
        if(!doc)  return res.render('error-404');
        const Days = doc.availableDays;
        const availableFrom = doc.availableFrom;
        const availableTill = doc.availableTill;
        res.send({Days, availableFrom, availableTill});
        
    } catch {
        //Internal Server Error
        res.send({Error: "Error"});
    } 
});

// Add Schedule by Doc _id
router.get('/add-schedule/:id', async(req, res) => {
            try{
                const doc = await doctor.findById(req.params.id);

                res.render('doctors/add-schedule', {id: doc._id, firstName: doc.firstName, lastName: doc.lastName, success_msg: req.flash('msg')} );
            }catch(e) {
                // Not Found
                console.log(e);
                res.render('error-404');
            }    
});

// Add Schedule of Doc 
router.post('/add-schedule/:id', async (req, res) => {
            try{
                const doc = await doctor.findById(req.params.id);
                // If not Found
                if(!doc) {
                    return res.render('error-404');
                }

                doc.availableDays = req.body.availableDays;
                doc.availableFrom = req.body.availableFrom;
                doc.availableTill = req.body.availableTill;
                await doc.save();
                req.flash('msg', 'Schedule added successfully');
                res.redirect(`/doctors/add-salary/${doc._id}`);
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
                res.render('doctors/edit-schedule', {id: req.params.id, firstName, lastName, availableDays, availableFrom, availableTill});
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
                doc.availableDays = req,body.availableDays;
                doc.availableFrom = req.body.availableFrom;
                doc.availableTill = req.body.availableTill;
                await doc.save();
                req.flash('msg', 'Schedule Updated Successfully');
                res.redirect(`/doctors/schedules`);
            } catch (e) {
                // Internal Server Error
                res.send(e);
            }        
});

//SALARY

// Doctors Salary List
router.get('/salary', async (req, res) => {
      let query = searchQuery(req);
       const url = "/doctors/salary";
    // Get Doctors
    try {
        const docs = await query.exec();
      // If no doctors 
        if(docs.length == 0){
                return res.render('doctors/salary', {info_msg: "No doctors available"});
        }
        res.render('doctors/salary', {docs, url, success_msg: req.flash('msg')});
    } catch (e) {
        // Internal Server Error
        res.status(500).render('error-500');
   }  
});

// Add Salary by Doc _id
router.get('/add-salary/:id', async(req, res) => {
        try{
            const doc = await doctor.findById(req.params.id);
            res.render('doctors/add-salary', {id: doc._id, firstName: doc.firstName, lastName: doc.lastName, success_msg: req.flash('msg')} );
        }catch {
            // Not Found
            res.render('error-404');
        }    
});

// Add Salary of Doc 
router.post('/add-salary/:id', async (req, res) => {
        const {basicSalary, accommodation, conveyance, otherExpenses} = req.body;
       // If basic Salray is not entered
        if (basicSalary === '') {
                    req.flash('msg', 'Please Enter Basic Salary')
                    res.redirect(`/doctors/add-salary/${req.params.id}`);
                    return;
        }
        try{
            const doc = await doctor.findById(req.params.id);
           // If not Found
            if(!doc) {
                return res.render('error-404');
            }
            doc.basicSalary = parseInt(basicSalary);
            doc.accommodation = parseInt(accommodation);
            doc.conveyance = parseInt(conveyance);
            doc.otherExpenses = parseInt(otherExpenses);
            doc.totalSalary = parseInt(doc.basicSalary + doc.accommodation + doc.conveyance + doc.otherExpenses);
            await doc.save();
            req.flash('msg', `Salary of Doctor ${doc.firstName} ${doc.lastName} added successfully`);
            res.redirect('/doctors/salary');
        } catch {
                res.render('error-500');
        }  
});

// Get Edit Salary by ID
router.get('/edit-salary/:id', async (req, res) => {
        try{
            // Get doctor by ID
            const doc = await doctor.findById(req.params.id);
            // If not Found
            if(!doc) {
                return res.render('error-404');
            }                
            const {firstName, lastName, basicSalary, accommodation, conveyance, otherExpenses} = doc;
            var name = doc.lastName + ',' + doc.firstName;
            res.render('doctors/edit-salary', {id: req.params.id, name, basicSalary, accommodation, conveyance, otherExpenses});
        } catch (e) {
            // Internal Server Error
            res.render('error-500');
        }            
});

// Edit Salary
router.patch('/edit-salary/:id', async (req, res) => {
        try{
             // Get doctor by ID
             const doc = await doctor.findById(req.params.id);

             // If not Found
             if(!doc) {
                 return res.render('error-404');
             } 
             //Update  
             doc.basicSalary = parseInt(req.body.basicSalary);
             doc.accommodation = parseInt(req.body.accommodation);
             doc.conveyance = parseInt(req.body.conveyance);
             doc.otherExpenses = parseInt(req.body.otherExpenses);
             doc.totalSalary = parseInt(doc.basicSalary + doc.accommodation + doc.conveyance + doc.otherExpenses);
             // save updates 
             await doc.save();
             req.flash('msg', `Salary of Doctor ${doc.firstName} ${doc.lastName} Edited successfully`);
             res.redirect('/doctors/salary');
        } catch (e) {
            // Internal Server Error
            res.render('error-500');
        }        
});

function assignAndRemoveImage (file) {
    if(file){
        const f = fs.readFileSync(file.path, 'base64');
        // Delete File from img Folder
        fs.unlink(path.join('', file.path), (e) => {
            if (e)  return console.log(e);
        console.log("File Deleted");
        }); 
    return f;      
    }
}

function searchQuery (req) {
            let query = doctor.find();
            if(req.query.name != null && req.query.name != '')
            {
                query = query.regex('firstName', new RegExp(req.query.name, 'i'));
            }
            if(req.query.department != null && req.query.department != '')
            {
                query = query.regex('department', new RegExp(req.query.department, 'i'));
            }
            if(req.query.joinedBefore != null && req.query.joinedBefore != '')
            {
                query = query.lte('joiningDate', req.query.joinedBefore);
            }
            if(req.query.joinedAfter != null && req.query.joinedAfter != '')
            {
                query = query.gte('joiningDate', req.query.joinedAfter);
            }
            return query;
} 


module.exports = router;

// const getDocs =  async () => {
//     const docs = await doctor.find({department: "Cancer"});
//     console.log(docs);
//     console.log("END");
// };

// module.exports = getDocs;






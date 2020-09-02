const express = require('express');

const router = new express.Router();
const patient = require('../models/patients');

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

//Get all patients
router.get('', async (req, res) => {
    try{
        const patients = await patient.find();
        const len = patients.length;
         // If no patients 
        if (!len) {                   
              return res.render('patients/patients', {info_msg: "No patients available"});                   
        }
    //   patients.forEach( patient => {  
    //                patient.admitDate = JSON.stringify(patient.admitDate).split('T')[0];
    // });
    res.render('patients/patients', {patients, success_msg: req.flash('msg')});            
    } catch (e) {   
        console.log(e);
        // Internal Server Error
        res.status(500).render('error-500');
    }
});

// // Get Single Patient by ID
router.get('/profile/:id', async (req, res) => {
  try {
      const Patient = await patient.findById(req.params.id);
      if (!Patient)  {
        //       //status 404 = Not Found
        //   return res.status(404).send();
        return res.render('error-404');
      }
     res.render('patients/profile', {Patient})
  } catch (e) {
      // Bad Request
      res.status(400).send(e);
  }
  
});

//ADD Patients Page
router.get('/add-patient', (req, res) => {
    res.render('patients/add-patient');
});


// Add patient
router.post('/add-patient', async (req, res) => {  
    //Object Destructing 
   const {firstName, lastName, age, gender, bloodGroup, disease, address, city, phone, email, status } = req.body;
   const Patients = await patient.find({});
   // For Generating Auto-incremental id
   const len = Patients.length+1;   

   const newPatient = new patient({id: len, firstName, lastName, age, gender, bloodGroup, disease, address, city, phone, email, status });
   let errors = [];
   if(!firstName || !gender || !status)
   {
           errors.push({msg: "Please fill all required Fields"});
           return res.render('patients/add-patient', {errors, newPatient})
   }
try{       
   await newPatient.save();   
   req.flash('msg', `Patient (${firstName} ${lastName}) added successfully`);
   res.redirect('/patients');
   //  // status 201 = Created
   // res.status(201).send('Account Created');    
   }
   catch  {
       // Internal Server Error
       res.render('error-500');
}
});

 // Get Edit Patient Page
 router.get('/edit-patient/:id', async (req, res) => {
     try{
        const Patient = await patient.findById(req.params.id);
        // If Patient doesn't exists
        if(!Patient) {
           return res.render('error-404');
        }
        res.render('patients/edit-patient', {patient: Patient, info_msg: req.flash('info_msg')});
     } catch {
         // Internal Server Error
         res.render('error-500');
     }
});

// Edit Patient
router.patch('/:id', async (req, res) => {
            // If any required field is not provided
            if(!req.body.firstName || !req.body.gender || !req.body.status)
            {
                    req.flash('info_msg', 'Please fill all required fields');
                    res.redirect(`/patients/edit-patient/${req.params.id}`);
                    return;
            }

            const updates = Object.keys(req.body);
            const allowedUpdates = ['firstName', 'lastName', 'age', 'bloodGroup', 'disease', 'gender',
                                    'address', 'city', 'phone', 'email', 'status'];
                                    
            const isValidOperation = updates.every( (update) => 
                                    allowedUpdates.includes(update));
            // If not allowed fields update requested
            if (!isValidOperation) {
                return res.redirect('/patients');
            }

            try {
                    const Patient =  await patient.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
                    if (!Patient) {
                    // Not Found
                    return res.render('error-404');
                    }
                    req.flash('msg', `Patient [${Patient.id} : ${Patient.firstName} ${Patient.lastName} ] updated Successully`);
                    res.redirect('/patients');    
            }
            catch {
               //Internal Server Error
                res.render('error-500');
            }
        });

 // Delete Single Patient
router.delete('/:id', async (req, res) => {
            try {
                    const Patient = await patient.findById(req.params.id);
                    if (!Patient)
                        {
                            // Not Found
                            return res.render('error-404');
                        }
                    // Delete Patient
                    await patient.findByIdAndDelete(req.params.id);   

                    // Serial No. of deleted patient
                    const deletedPatientID = Patient.id;                

                    // Decrement id (Serial No.)  by one of all accounts below deleted account
                    await patient.updateMany({"id" : {$gt: deletedPatientID}}, {$inc: {id: -1}});
                    
                    req.flash('msg', 'Patient Deleted Successfully');
                    res.redirect('/patients');
                } catch {
                //Internal Server Error
                res.render('error-500');
            }
    });

 // Delete All Patients (Promise)
router.delete('/', (req, res) => {
    
    patient.deleteMany().then( (doc) =>  {
     
        // if db is empty
        if (doc.deletedCount == 0)
        {
            // Not Found
            return res.status(404).send();
        }
        // Gone 
        res.status(410).send('All Deleted')
     } )
     // Internal Server Error
    .catch (e => res.status(500).send(e)); 
 });

module.exports = router;
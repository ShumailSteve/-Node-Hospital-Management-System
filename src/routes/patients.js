const express = require('express');

const router = new express.Router();
const patient = require('../models/patients');

//Get all patients
router.get('', async (req, res) => {
    try{
        const patients = await patient.find();
        const len = patients.length;
         // If no patients 
        if (!len) {                   
              return res.render('patients/patients', {info_msg: "No patients available"});                   
        }
    res.render('patients/patients', {patients, success_msg: req.flash('msg')});            
    } catch (e) {
        // Internal Server Error
        res.status(500).render('error-500');
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
   console.log("try"); 
   await newPatient.save();   
   req.flash('msg', `Patient (${firstName} ${lastName}) added successfully`);
   res.redirect('/patients');
   //  // status 201 = Created
   // res.status(201).send('Account Created');    
   console.log("DONE");
   }
   catch (e) {
       // Iternal Server Error
       res.status(500).send(e);
}
});



 // Get Edit Patient Page
 router.get('/edit-patient', (req, res) => {
    res.render('patients/edit-patient');
});




// // Get Single Patient by ID
// router.get('/profile/:id', async (req, res) => {
//   try {
//       const Patient = await patient.findById(req.params.id);
//       if (!Patient)  {
//               //status 404 = Not Found
//           return res.status(404).send();
//       }
//      res.send(Patient);
//   } catch (e) {
//       // Bad Request
//       res.status(400).send(e);
//   }
  
// });



// Delete Single Patient
router.delete('/:id', async (req, res) => {
        try {
                  const id = req.params.id;
                // Get num of account being deleted
                const Patient = await patient.findById(id);
                if (!Patient)
                    {
                        // Not Found
                        return res.status(404).send();
                    }
                const patientID = Patient.id;
               
                // Delete Account
                await patient.findByIdAndDelete(id);                

                // Decrement nums by one of all accounts below deleted account
                await patient.updateMany({"id" : {$gt: patientID}}, {$inc: {id: -1}});
                
                // Status 410 = Deleted
                res.status(410).send('Account Deleted');
            } catch (e) {
            res.status(400).send(e);
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



// Edit Patient
router.patch('/:id', async (req, res) => {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'lastName', 'age', 'username', 'email', 'password', 'DOB', 'gender', 
                                'bloodGroup', 'address', 'country', 'city', 'postalCode', 'phone', 'img', 'details', 'status'];
                                
        const isValidOperation = updates.every( (update) => 
                                 allowedUpdates.includes(update));
       
        if (!isValidOperation) {
            return res.status(400).send({error: 'Invalid Updates!'});
        }
          // // Parse only if DOB update required
          if(req.body.DOB)
          {
            const date = JSON.parse(req.body.DOB);
            req.body.DOB = date;
          }
          
          
        try {
                const user =  await patient.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
                if (!user) {
                   // Not Found
                   return res.status(404).send();
                }
                res.send(user);
        }
        catch (e) {
            res.status(400).send(e);
        }
});

module.exports = router;
const express = require('express');

const router = new express.Router();
const patient = require('../models/patients');

const auth = require('../middleware/auth');

// Authenticate all routes 
router.all("*", auth);


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
            let query = searchQuery(req);
            const url = "/patients"
            try{
                const patients = await query.exec();
                const len = patients.length;
                // If no patients 
                if (!len) {                   
                    return res.render('patients/patients', {info_msg: "No patients available"});                   
                }
            //   patients.forEach( patient => {  
            //                patient.admitDate = JSON.stringify(patient.admitDate).split('T')[0];
            // });
            res.render('patients/patients', {patients, url, success_msg: req.flash('msg')});            
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

//Get Num of Patients per month 
router.get('/perMonth', async (req, res) => {
            const Patients = await patient.find({});

            // patientsPerMonth return array of nums 
            const data = patientsPerMonth(Patients);
            res.send({data});
});

//Get Num of Patients per month as per disease
router.get('/diseasePerMonth', async (req, res) => {
    const Patients = await patient.find({});

    // patientsPerMonth return array of nums 
    const data = patientsDiseasePerMonth(Patients);
    
    res.send({data});
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
   if(!firstName || !age || !gender || !status )
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
   catch (e) {
       console.log(e);
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

 function searchQuery(req) {
        let query = patient.find();
        if(req.query.name != null && req.query.name != '') {
                query = query.regex('firstName', new RegExp(req.query.name, 'i'));
        }
        if(req.query.age != null && req.query.age != '') {
            query = query.where('age', req.query.age)
        } 
        if(req.query.disease != null && req.query.disease != '') {
            query = query.regex('disease', new RegExp(req.query.disease, 'i'));
        }
        if(req.query.admittedBefore != null && req.query.admittedBefore != '') {
            query = query.lte('admitDate', req.query.admittedBefore);
        } 
        if(req.query.admittedAfter != null && req.query.admittedAfter!= '') {
            query = query.gte('admitDate', req.query.admittedAfter)
        } 
        return query;
 }

 // Return array containing num of patients per month
 function patientsPerMonth (Patients) {
        
        // 0 filled Array of num of patient per months 
        let data = new Array(12).fill(0);
            
        // Find admit month of each patient and inc respective month by 1
        Patients.forEach ((doc) => {
            const monthIndex = new Date(doc.admitDate).getMonth();
            data[monthIndex]++;
        });

        return data;
 };

  // Return array containing num of patients per month as per disease
  function patientsDiseasePerMonth (Patients) {
        
    // 0 filled Array of major diseases Patients per month
    let feverData = new Array(12).fill(0);
    let cancerData = new Array(12).fill(0);
    let heartData = new Array(12).fill(0);
   
        
    // Find admit month of each patient and inc respective month by 1
    Patients.forEach ((doc) => {

        // Get month index to access array positions
        const monthIndex = new Date(doc.admitDate).getMonth();

        // if fever patient inc by 1 of respective month
        if(doc.disease == "Fever")
        {
            feverData[monthIndex]++;
        }

         // if cancer patient inc by 1 of respective month
        if(doc.disease == "Cancer")
        {
            cancerData[monthIndex]++;
        }

         // if heart patient inc by 1 of respective month
         if(doc.disease == "heart")
         {
             heartData[monthIndex]++;
         }
        
    });

    return [feverData, cancerData, heartData];
};

module.exports = router;
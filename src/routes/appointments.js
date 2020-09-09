const express = require('express');
const router = new express.Router();

const appointment = require('../models/appointment');
const patient = require('../models/patients');
const doctor =  require('../models/patients');
const department = require('../models/department');
const getDate = require("../functions/getDate");
const getTime = require("../functions/getTime");

//Get all appointments
router.get('/',  async (req, res) => {
        try {
             const appointments = await appointment.find({});
             const len = appointments.length;
             if (!len) {
                 return res.status(404).send("NO");
             }
             res.render('appointments/appointments', {appointments});
        } catch (e) {
            res.status(500).send();
        }
        
});

// Get Add Appointment Page
router.get('/add-appointment',  async(req, res) => {
    const patients = await patient.find({});
    const doctors = await doctor.find({});
    const appointments = await appointment.find({});
    const departments = await department.find({});
    const len = appointments.length + 1;
    let errors = [];
    errors.push({msg: req.flash('msg')});
    res.render('appointments/add-appointment', {id: len, patients, doctors, departments, errors});
});

// Get Edit Appointment Page
router.get('/edit-appointment',  async(req, res) => {
    
    res.render('appointments/edit-appointment');
});

// Get by ID
router.get('/:id',  async(req, res) => {
    try {
         const app = await appointment.findById(req.params.id);
            if (!app) {
             return res.status(404).send();
         }
         res.send(app);
    } catch (e) {
        res.status(400).send();
    }
});

// Get Add Appointments Page
router.get('/add-appointment', (req, res) => {
    // res.render('add-appointment');
    res.send("HH");
});

//Add appointment
router.post('/add-appointment', async (req, res) => {
     // Object Destructuring
     const {patient, department, doctor, appointmentDate, appointmentTime, message, status} = req.body;
     let errors = [];
     // If required fields are empty
     if(!patient || !department || !doctor || !appointmentDate || !appointmentTime || !status) {
         req.flash('msg', 'Please fill all required fields');
         res.redirect("/appointments/add-appointment");
         return;
     }

     const Appointments = await appointment.find({});
     // For Generating Auto-incremental id
     const len = Appointments.length+1;

    const newAppointment = new appointment({id: len, patient, department, doctor, appointmentDate, appointmentTime, message, status});
   
    try {
          await newAppointment.save();
            res.redirect('/appointments');
     }  catch (e) {
            // Internal Server Error
            res.status(500).send(e);
    }
});

//Edit appointment
router.patch('/:id', async (req, res) => {
            const updates = Object.keys(req.body);
            const allowedUpdates = ['patientID', 'patientName', 'department', 'doctor', 'appointmentDate', 'appointmentTime', 'message', 'status'];
                                    
            const isValidOperation = updates.every( (update) => 
                                    allowedUpdates.includes(update));
        
            if (!isValidOperation) {
                return res.status(400).send({error: 'Invalid Updates!'});
            }

            // // Parse incoming Date and Time
            // Parse if date update required
            if(req.body.appointmentDate)
            {
                const appointmentDate = getDate(req.body.appointmentDate);
                req.body.appointmentDate = appointmentDate;
            }
             // Parse if time update required
            if(req.body.appointmentTime){
                const appointmentTime = getTime(req.body.appointmentTime);
                req.body.appointmentTime = appointmentTime;
            }
                    //Obj Destructuring
                // const {patientID, patientName, department, doctor,message, status} = req.body;
            try {
                    const Appointment = await appointment.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});                                                         
                   
                    // If no appointments in DB
                    if (!Appointment) {
                        return res.status(404).send();
                    }
                    res.send(Appointment);
            }  catch (e) {
                //Internal Server Error
                res.status(500).send(e);
            }
});

//Delete All
router.delete('/', async (req, res) => {
    try{
         const doc = await appointment.deleteMany();
        if (doc.deletedCount == 0) {
            res.status(404).send();
        }
        //Gone
        res.status(410).send();
    } catch(e) {
        res.status(500).send();
    }
 });

 // Delete Single appointment
router.delete('/:id', async (req, res) => {
    try {
              const id = req.params.id;
            // Get num of account being deleted
            const Appointment = await appointment.findById(id);
            if (!Appointment)
                {
                    // Not Found
                    return res.status(404).send();
                }
            const AppointmentID = Appointment.id;
           
            // Delete Account
            await appointment.findByIdAndDelete(id);                

            // Decrement nums by one of all accounts below deleted account
            await appointment.updateMany({"id" : {$gt: AppointmentID}}, {$inc: {id: -1}});
            
            // Status 410 = Deleted
            res.status(410).send();
        } catch (e) {
        res.status(400).send(e);
    }
});



module.exports = router;
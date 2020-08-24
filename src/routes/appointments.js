const express = require('express');
const router = new express.Router();

const appointment = require('../models/appointments');
const getDate = require("../functions/getDate");
const getTime = require("../functions/getTime");

//Get all appointments
router.get('/',  async(req, res) => {
        // try {
        //      const appointments = await appointment.find();
        //      const len = appointments.length;
        //      if (!len) {
        //          return res.status(404).send();
        //      }
        //      res.send({appointments, len});
        // } catch (e) {
        //     res.status(500).send();
        // }
        res.render('appointments/appointments');
});

// Get Add Appointment Page
router.get('/add-appointment',  async(req, res) => {
    
    res.render('appointments/add-appointment');
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

        //  const appointmentDate = req.body.appointmentDate;
        // const appointmentTime = JSON.parse(req.body.appointmentTime);
      
        // const d1 = new Date(appointmentTime);
        // const date = d1.getUTCDate();
        // const mon = d1.getUTCMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12 
        // const year = d1.getUTCFullYear();
        // const newDate = date + "/" + mon + "/" + year;
        // console.log(newDate);
        // const time = d1.getUTCHours();
        // const min = d1.getUTCMinutes()
        // console.log(time+':'+min);

    const Appointments = await appointment.find();
    // For Generating Auto-incremental id
    const len = Appointments.length+1;

    // // Parse incoming Date and Time
    const appointmentDate = getDate(req.body.appointmentDate);
    const appointmentTime = getTime(req.body.appointmentTime);

    // Object Destructuring
    const {patientID, patientName, department, doctor, message, status} = req.body;
    try {
        
            const newAppointment = new appointment({id: len, patientID, patientName, department, doctor, appointmentDate, appointmentTime, message, status});
            await newAppointment.save();
            res.status(201).send();
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
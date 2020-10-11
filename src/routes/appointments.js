require('dotenv').config(); // For accessing environment variables
const express = require('express');
const router = new express.Router();

const nodemailer = require("nodemailer");

const appointment = require('../models/appointment');
const patientModel = require('../models/patients');
const doctorModel =  require('../models/doctor');
const department = require('../models/department');
const getDate = require("../functions/getDate");
const getTime = require("../functions/getTime");

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

 
//Get all appointments
router.get('/',  async (req, res) => {
        try {
            //  const appointments = await appointment.findOne({}).populate('patient').exec();
            const appointments = await appointment.find({})
                                    .populate('patient', 'firstName lastName')
                                    .populate('doctor', 'firstName lastName').exec();
             const len = appointments.length;
             if (!len) {
                    return res.render('appointments/appointments', {info_msg: "No Appointments available"} )
             }

             res.render('appointments/appointments', {appointments, info_msg: req.flash('msg')});
        } catch (e) {
            console.log(e);
        }
        
});

// Get Add Appointment Page
router.get('/add-appointment',  async(req, res) => {
            const patients = await patientModel.find({status: "active"});
            const appointments = await appointment.find({});
            const departments = await department.find({status: "active"});
            const len = appointments.length + 1;
            let errors = [];
            errors.push({msg: req.flash('msg')});
            res.render('appointments/add-appointment', {id: len, patients, departments, errors});
});

// Get Edit Appointment Page
router.get('/edit-appointment/:id',  async(req, res) => {
            let errors = [];
            const patients = await patientModel.find({});
            const departments = await department.find({});
            const appt = await appointment.findById(req.params.id)
                                .populate('patient', 'id firstName lastName')
                                .populate('doctor', 'id firstName lastName availableDays availableFrom availableTill')
                                .exec();
            const doctors = await doctorModel.find({department: appt.department});
            errors.push({msg: req.flash('msg')});
            res.render('appointments/edit-appointment', { appointment: appt, patients, departments, doctors, errors});
});

//Add appointment
router.post('/add-appointment', async (req, res) => {
            // Object Destructuring
            const {patient, department, doc, appointmentDate, appointmentTime, message, status} = req.body;

            // If required fields are empty
            if(!patient || !department || !doc || !appointmentDate || !appointmentTime || !status) {
                req.flash('msg', 'Please fill all required fields');
                res.redirect("/appointments/add-appointment");
                return;
            }
            var appointmentDay = getAppointmentDay(appointmentDate);
            const Doctor = await  doctorModel.findById(doc);

            // If Appointment Day includes in Doctor Available Days
            var isValidDay = (Doctor.availableDays.includes(appointmentDay));

            // If Invalid Day
            if(isValidDay == false) {
                 req.flash('msg', 'Doctor not available on selected day, please select correct day');
                 res.redirect("/appointments/add-appointment");
                 return;
            }
                
            // If appointment Time is less than Doctor's Available hours
           if ( appointmentTime < Doctor.availableFrom) {
                    req.flash('msg', "Selected Time is less than Doctor's Available Time");
                    res.redirect("/appointments/add-appointment");
                    return;
           }
             // If appointment Time is greater than Doctor's Available hours
             if ( appointmentTime > Doctor.availableTill) {
                    req.flash('msg', "Selected Time is greater than Doctor's Available Time");
                    res.redirect("/appointments/add-appointment");
                    return;
           }
             // If Doctor has already an appointment on the selected time
           const ifAlreadyExists = await appointment.find({doctor: doc, appointmentDate, appointmentTime});
           if(ifAlreadyExists.length !== 0) {
                req.flash('msg', 'Doctor already has appointment on selected time, please select another time');
                res.redirect("/appointments/add-appointment");
                return;
           }
            const Appointments = await appointment.find({});
            // For Generating Auto-incremental id
            const len = Appointments.length+1;

            const newAppointment = new appointment({id: len, patient, department, doctor: doc, appointmentDate, appointmentTime, message, status});
        
            try {
                await newAppointment.save();
                const Patient = await patientModel.findById(patient);
                console.log(Patient);

                // Generate msg to send
                const output = `
                            <h3>HMS Appointment Details</h3>
                            <div>
                                Patient Name: ${Patient.firstName} ${Patient.lastName} <br>
                                Doctor Name:  ${Doctor.firstName} ${Doctor.lastName} <br>
                                Appointment Date: ${newAppointment.appointmentDate} <br>
                                Appointment Time: ${newAppointment.appointmentTime} <br>
                                <em> Looking forward to see you soon :) </em>
                            </div>  `;

                 // Send Appointment Details to patient           
                sendMailFunction(output).
                        then( () => console.log("Sent") ).
                        catch (e => console.log(e)) ;
                
                res.redirect('/appointments');
            }  catch {
                    // Internal Server Error
                    res.render('error-500');
            } 
});

//Edit appointment
router.patch('/:id', async (req, res) => {
            const updates = Object.keys(req.body);
            const allowedUpdates = ['patient', 'department', 'doctor', 'appointmentDate', 'appointmentTime', 'message', 'status'];
                                    
            const isValidOperation = updates.every( (update) => 
                                    allowedUpdates.includes(update));
        
            if (!isValidOperation)  return res.redirect('/appointments');

             // Object Destructuring
             const {patient, department, doctor, appointmentDate, appointmentTime, message, status} = req.body;

             // If required fields are empty
             if(!patient || !department || !doctor || !appointmentDate || !appointmentTime || !status) {
                    req.flash('msg', 'Please fill all required fields');
                    res.redirect(`/appointments/edit-appointment/${req.params.id}`);
                    return;
             }
             var appointmentDay = getAppointmentDay(appointmentDate);
             const Doctor = await  doctorModel.findById(doctor);
 
             // If Appointment Day includes in Doctor Available Days
             var isValidDay = (Doctor.availableDays.includes(appointmentDay));
 
             // If Invalid Day
             if(isValidDay == false) {
                    req.flash('msg', 'Doctor not available on selected day, please select correct day');
                    res.redirect(`/appointments/edit-appointment/${req.params.id}`);
                    return;
             }
                 
             // If appointment Time is less than Doctor's Available hours
            if ( appointmentTime < Doctor.availableFrom) {
                     req.flash('msg', "Selected Time is less than Doctor's Available Time");
                     res.redirect(`/appointments/edit-appointment/${req.params.id}`);
                     return;
            }
              // If appointment Time is greater than Doctor's Available hours
              if ( appointmentTime > Doctor.availableTill) {
                     req.flash('msg', "Selected Time is greater than Doctor's Available Time");
                     res.redirect(`/appointments/edit-appointment/${req.params.id}`);
                     return;
            }
              // If Doctor has already an appointment on the selected time
            const ifAlreadyExists = await appointment.find({doctor, appointmentDate, appointmentTime});
            // If Appointment not exists 
            if(ifAlreadyExists.length !== 0) {
                    if(ifAlreadyExists[0].doctor != doctor) {
                    req.flash('msg', 'Doctor already has appointment on selected time, please select another time');
                    res.redirect(`/appointments/edit-appointment/${req.params.id}`);
                    return;
                    }
            }
            try {
                    const Appointment = await appointment.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});                                                         
                   
                    // If no appointments in DB
                    if (!Appointment) {
                        return res.send('error-404');
                    }
                    req.flash('msg', `Appointment No. ${Appointment.id} updated successfully`);
                    res.redirect('/appointments');
            }  catch {
                    //Internal Server Error
                      res.render('error-500');
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
                            return res.render('error-404');
                        }
                    const AppointmentID = Appointment.id;
                
                    // Delete Account
                    await appointment.findByIdAndDelete(id);                

                    // Decrement nums by one of all accounts below deleted account
                    await appointment.updateMany({"id" : {$gt: AppointmentID}}, {$inc: {id: -1}});
                    res.redirect('/appointments');
                    // Status 410 = Deleted
                    // res.status(410).send();
                } catch (e) {
                res.status(400).send(e);
            }
});

// Delete All
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


function getAppointmentDay (appointmentDate) {
    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dayInt = new Date(appointmentDate).getDay();
    // Convert dayInt to dayString
    var dayString = weekdays[dayInt];
     return dayString;
}

function sendMailFunction (output) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                    user: process.env.EMAIL, 
                    pass: process.env.PASSWORD, 
                }
            });
                        
        let mailOptions = {
            from: '<sender_mail>', // sender address
            to: "<receiver_mail>", // list of receivers
            subject: "HMS Appointment Details", // Subject line
            html: output // html body
        }

        return transporter.sendMail(mailOptions);

}

module.exports = router;
const express = require('express');
const router = new express.Router();
const doctorModel = require('../models/doctor');
const patientModel = require('../models/patients');
const wardModel = require('../models/ward');
const roomModel = require('../models/room');
const appointmentModel = require('../models/appointment');
const auth = require('../middleware/auth');

//Get Requests
router.get('', auth, (req, res) => {
    res.render('index');
});

router.get('/index', auth, async (req, res) => {
        const Doctors = await doctorModel.find({});
        const Patients = await patientModel.find({});
        const Rooms  = await roomModel.find({});
        const Wards = await wardModel.find({});
        const Appointments = await appointmentModel.find({}).
                                populate('patient', 'firstName lastName').
                                populate('doctor', 'firstName lastName').exec();

        const no_of_Doctors = Doctors.length;
        const no_of_Patients = Patients.length;
        const no_of_Rooms = Rooms.length;
        const no_of_Wards = Wards.length;
  
        res.render('index', { 
                            username: req.user.username,
                            no_of_Doctors, 
                            no_of_Patients, 
                            no_of_Rooms, 
                            no_of_Wards,
                            Doctors,
                            Appointments, 
                            Patients
                            });
});

module.exports = router;
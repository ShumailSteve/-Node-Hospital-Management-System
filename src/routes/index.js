const express = require('express');
const router = new express.Router();
const doctorModel = require('../models/doctor');
const patientModel = require('../models/patients');
const wardModel = require('../models/ward');
const roomModel = require('../models/room');
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

        const no_of_Doctors = Doctors.length;
        const no_of_Patients = Patients.length;
        const no_of_Rooms = Rooms.length;

        var no_of_Beds = 0;
        // Sum of all beds in all wards
        Wards.forEach( (ward) => no_of_Beds+=ward.bedCapacity);
 
        res.render('index', {username: req.user.username, 
                            no_of_Doctors, 
                            no_of_Patients, 
                            no_of_Rooms, 
                            no_of_Beds,
                            Doctors
                            });
});

module.exports = router;
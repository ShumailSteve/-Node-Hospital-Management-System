const express = require('express');
const router = new express.Router();
const Ward = require('../models/ward');
const Room = require('../models/room');
const Patient = require('../models/patients');

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


//WARDS

router.get('/wards', async (req, res) => {
            const wards = await Ward.find({});
            // If no ward
            if(wards.length == 0) {
                return res.render('hospital/wards/wards', { info_msg: 'No Ward Available'});
            }
             res.render('hospital/wards/wards', {wards, info_msg: req.flash('msg')});
});

// Add new Ward Page
router.get('/wards/add-ward',async  (req, res) => {
            const wards = await Ward.find({});
            res.render('hospital/wards/add-ward');
});

//Get Ward by ID
router.get('/wards/:id', async (req, res) => {
            try{   
                // Find Ward and Populate patient in beds array  
                const ward = await Ward.findById(req.params.id).
                                    populate( { 
                                                path : 'beds', 
                                                // Populate patient and select _id, firstName, and lastName
                                                populate: {path: 'patient', select: 'firstName lastName'}
                                     });
            
                // If No ward exists with given id
                if (!ward) {
                    return res.render('error-404');
                }
                const beds = ward.beds;
                res.render('hospital/wards/ward-details', {
                                                        beds,
                                                        wardID: ward.wardID,
                                                        wardName: ward.wardName,
                                                        bedCapacity: ward.bedCapacity,
                                                        bedsAvailable: ward.bedsAvailable,
                                                        bedsOccupied: ward.bedsOccupied,
                                                        info_msg: req.flash('msg')
                                                    });                
            } catch {
                    //Internal Server Error
                    res.render('error-500');
            }
});

// Add ward 
router.post('/wards', async (req, res) => {
        try{
            const wards = await Ward.find({});

            const len = wards.length;

           // Obj Destructuring
            const {wardName, bedCapacity, wardStatus } = req.body;
            
            // Already existing wards count for generating wardID                        
            const newWard = new Ward({wardID: len+1, wardName, bedCapacity, wardStatus, bedsAvailable: bedCapacity });
            let errors = [];
            if (!wardName || !bedCapacity || !wardStatus) {
                errors.push({msg: "Please fill all required fields"});
                return res.render('hospital/wards/add-ward', {newWard, errors})
            }
            var ID = 1;
            // Run loop (bedCapacity) times
            for (i=0; i < bedCapacity; i++) {
                    // Push bedID = ID to beds array and increments 
                    newWard.beds.push({"bedID": ID++});
                }       
               await newWard.save();
            req.flash('msg', `Ward No. ${newWard.wardID} added successfully`);
            res.redirect('/hospital/wards');
        } catch  {
            //Internal Server Error
            res.render('error-500'); 
    }        
});

// Get edit ward Page by ID
router.get('/wards/edit-ward/:id', async (req, res) => {
            const ward = await Ward.findById(req.params.id);
            const {_id, wardName, bedCapacity, wardStatus} = ward;
             res.render('hospital/wards/edit-ward', {_id, wardName, bedCapacity, wardStatus});
});


//Edit ward
router.patch('/wards/:id', async (req, res) => {
            const updates = Object.keys(req.body);
            const allowedUpdates = ['wardName', 'bedCapacity', 'wardStatus'];
                                    
            const isValidOperation = updates.every( (update) => 
                                    allowedUpdates.includes(update));

            // If any invalid update is requested
            if (!isValidOperation) {
                return res.redirect('/hospitals/wards');
            }

            const {wardName, bedCapacity, wardStatus} = req.body;
            try {
                    const ward = await Ward.findById(req.params.id); 

                // If bedCapacity update required 
                if(bedCapacity || bedCapacity == 0 )  {
                        // Current bed Capacity
                    var currentCap = ward.bedCapacity;
                
                    // If bedCapacity is increased in update                                                        
                    if(ward.bedCapacity < bedCapacity)  {   

                        // No. of Beds to increase
                        const inc = bedCapacity - currentCap;
                        
                        // Add new Beds
                        for (i=0; i < inc; i++) {

                            // Push bedID = ID to beds array and increments 
                            ward.beds.push({"bedID": ++currentCap});
                            }   
                    }
                    else {
                        // No. of Beds to decrease
                        const dec = currentCap - bedCapacity;
                                        
                        // Delete beds from array
                        for (i=0; i < dec; i++) {
                            // Removes last elements from array
                            ward.beds.pop();
                            }   
                     }
                     // Update Number of beds Available
                     ward.bedsAvailable = bedCapacity - ward.bedsOccupied; 

                }
                ward.wardName = wardName;
                ward.bedCapacity = bedCapacity;
                ward.wardStatus = wardStatus;
               
                await ward.save(); 
                req.flash('msg', `Ward no. ${ward.wardID} update successfully`);
                res.redirect('/hospital/wards');                    
            }  catch {
                //Internal Server Error
                res.render('error-500');
            } 
});




// Delete by id
router.delete('/wards/:id', async (req, res) => {
            try {
                    const id = req.params.id;

                    // Find ward to be deleted
                    const ward = await Ward.findById(id);
                    // Not Found
                    if (!ward)
                        {
                            return res.render('error-404');
                        }
                    // ID of ward to be deleted   
                    const wardNum = ward.wardID;
                
                    // Delete Ward
                    await Ward.findByIdAndDelete(id);                

                    // Decrement ids by one of all wards below deleted ward
                    await Ward.updateMany({"wardID" : {$gt: wardNum}}, {$inc: {wardID: -1}});

                    req.flash('msg', "Ward Deleted Successfully");
                    res.redirect('/hospital/wards');
                } catch {
                    //Internal Server Error
                    res.render('error-500');
            }
});

// Delete All Wards
router.delete('/wards', async (req, res) => {
    try {
        const doc = await ward.deleteMany();     
        // if db is empty
        if (doc.deletedCount == 0)
        {
               // Not Found
            return res.status(404).send();
        }
        // Gone 
        res.status(410).send('All Deleted');
    } catch(e) {
        res.status(500).send(e); 
    } 
});

//BEDS

// Allot Bed to patient 
router.get('/allot-bed', async (req, res) => {
            // Find all patients that are active
            const patients = await Patient.find({status: "active"});
              // Find all wards that are active
            const wards = await Ward.find({wardStatus: "active"});
            res.render('hospital/wards/allot-bed', {patients, wards});
});

// Get Beds that are free of specific Waard 
router.get('/ward/beds', async (req, res) => {
            try {
                // const ward = await Ward.findById(req.query.wardID);
                const ward = await Ward.find({_id: req.query.wardID, wardStatus: "active"});

                // If no Ward with given id
                if(!ward)  return res.status(400).send("No Ward");

                // Get Array of Beds of ward
                var Beds = ward[0].beds;
         
                // Arrays of bed ids to send as a result 
                var bedIDs = [];

                // push name of each doctor
                Beds.forEach( bed => { 
                                    if(bed.bedstatus == "free") {
                                        bedIDs.push(bed.bedID);
                                    }                                   
                });
                    res.send({bedIDs});
                } catch {
                    //Internal Server Error
                    res.send({Error: "Error"});
                } 
                
});

// Allot bed to patient 
router.post('/allot-bed', async (req, res) => {
            try{    
                    // Get Ward by wardID
                    const ward = await Ward.findById(req.body.ward);
                   
                    // TO access beds by Array Index
                    const bedIndex = req.body.bedID - 1;
                
                    // // Update bedStatus 
                    ward.beds[bedIndex].bedstatus = "occupied";
                    ward.beds[bedIndex].patient = req.body.patient;
                    ward.beds[bedIndex].attendentName = req.body.attendentName;
                    ward.beds[bedIndex].allotedFrom = req.body.allotedFrom;
                    
                    //Decrement bedsAvailable by 1
                    ward.bedsAvailable--;

                    // Increment 1 in bedsOccupied
                    ward.bedsOccupied++;
     
                    await ward.save();
                    req.flash('msg', `Bed No. ${bedIndex+1} allotted successfully`);
                    res.redirect(`/hospital/wards/${ward._id}`);              
                   
              } catch {
                // If ward not found
                res.render('error-404');
            }
});


// Deallocated Bed
router.post('/deallocate-bed/:bed_id/:bedID', async (req, res) => {
         try{    
            // Get Ward by wardID
            const ward = await Ward.find({'beds._id': req.params.bed_id});
           
            // TO access beds by Array Index
            const bedIndex = req.params.bedID - 1;

            // If bed to deallocate is occupied 
            if (ward[0].beds[bedIndex].bedstatus == "occupied") {
                // Deallocate bed 
                    ward[0].beds[bedIndex].bedstatus = "free";
                    ward[0].beds[bedIndex].patient = null;
                    ward[0].beds[bedIndex].attendentName = null;
                    ward[0].beds[bedIndex].allotedFrom = null;
                    
                    //Increment bedsAvailable by 1
                    ward[0].bedsAvailable++;

                    // Decrement bedsOccupied by 1 
                    ward[0].bedsOccupied--;

                    await ward[0].save();
                    req.flash('msg', `Bed No. ${bedIndex+1} deallocated successfully`);
            }
            res.redirect(`/hospital/wards/${ward[0]._id}`);               
           
      } catch {
        // If ward not found
        res.render('error-404');
    } 
});

// ROOMS 

// Get all Rooms
router.get('/rooms', async (req, res) => {
            try{
                const rooms = await Room.find({}).populate('patient', '_id firstName lastName').exec();
                const len = rooms.length;

                //If No Room
                if (!len) {
                    res.render('hospital/rooms/rooms', {info_msg: "No rooms available"});
                }

                res.render('hospital/rooms/rooms', {rooms, info_msg: req.flash('msg')});
            } catch {
                // Internal Server Error
                res.render('error-500');
            }   
});

// Get Add Room Page
router.get('/rooms/add-room', async (req, res) => {   
            //Find all rooms
            const rooms = await Room.find({});

            // No. of rooms
            const len = rooms.length;

            res.render('hospital/rooms/add-room', {roomID: len+1});    
});


// Add room 
router.post('/add-room', async (req, res) => {
        try{
            const rooms = await Room.find({});

            // Already existing rooms count for generating Room ID
            const len = rooms.length;
                        
            const newRoom = new Room({
                                        id: len+1, 
                                        details: req.body.details, 
                                    });
           // Save new Room to DB
            await newRoom.save();
            
            req.flash('msg', `Room no. ${newRoom.id} added successfully`);
            //Redirect to rooms list       
            res.redirect('/hospital/rooms');
        } catch {
            // Internal Server Error
            res.render('error-500');
        }
}); 

// Get room by ID to Allot
router.get('/rooms/allot-room/:id', async (req, res) => {
            try{
                // Find room by ID
                const room = await Room.findById(req.params.id);

                // Not Found
                if(!room) {
                    return res.render('error-404');
                }

                // Find all patients
                const patients = await Patient.find({});

                res.render('hospital/rooms/allot-room', {
                                                        _id: room._id,
                                                        roomID: room.id,
                                                        patients
                                                        });  
            } catch {
                //Internal Server Error
                res.render('error-500');
            }           
});

//Allot room 
router.patch('/rooms/:id', async (req, res) => {
    console.log(req.body);
            try{
                     // Get Room by Room ID
                     const room = await Room.findOneAndUpdate({_id: req.params.id}, {
                                                                status: "occupied", 
                                                                patient: req.body.patient,
                                                                attendentName: req.body.attendentName,
                                                                allotedFrom: req.body.allotedFrom
                                                                }, 
                                                                {new: true, runValidators: true}
                                                            );
                    //Redirect to rooms
                    req.flash('msg', `Room no. ${room.id} allotted successfully`);
                    res.redirect('/hospital/rooms');

            } catch (e) {
                console.log(e);
            }
});


// Delete Room by id
router.delete('/rooms/:id', async (req, res) => {
            try { 
                    // Get Room by ID
                    const room = await Room.findById(req.params.id);
        
                    //Not Found
                    if (!room)  {
                                return res.render('error-400');
                        }

                    // Assign id of doctor, to be deleted, to Num
                    const Num = room.id;
                
                    // Delete Account
                    await Room.findByIdAndDelete(req.params.id);                

                    // Decrement nums(id) by one of all rooms below deleted room
                    await Room.updateMany({"id" : {$gt: Num}}, {$inc: {id: -1}});
                    
                    // Redirect to all rooms
                    req.flash('msg', "Room deleted successfully");
                    res.redirect('/hospital/rooms');

                } catch (e) {
                   // Internal Server Error
                        res.render('error-500');
            }
});

module.exports = router;
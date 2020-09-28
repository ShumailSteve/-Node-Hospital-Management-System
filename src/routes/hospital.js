const express = require('express');
const router = new express.Router();
const Ward = require('../models/ward');
const room = require('../models/room');
const asset = require('../models/asset');

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
        const ward = await Ward.findById(req.params.id);
     
        // If No ward exists with given id
        if (!ward) {
            return res.status(404).send();
        }
        const beds = ward.beds;
        
    } catch (e) {
        // Bad request
        res.status(400).send(e);
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
            const newWard = new Ward({wardID: len+1, wardName, bedCapacity, wardStatus });
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
        } catch {
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


router.get('/allot-bed', (req, res) => {
    res.render('hospital/wards/allot-bed');
});

router.get('/wards/edit-bed', (req, res) => {
    res.render('hospital/edit-bed');
});

router.get('/wards/edit-ward', (req, res) => {
    res.render('hospital/edit-ward');
});


// Get Beds that are free of specific Waard (TO BE DONE)
router.get('/allot-bed/:id', async (req, res) => {
        // try {
        //             const Ward = await ward.findById(req.params.id);
        //             const WardID = Ward.wardID;
        //             let Beds = [];
        //             Ward.beds.forEach( bed => {
        //                 if(bed.bedstatus === "free")
        //                 {
        //                     Beds.push(bed);
        //                 }
        //             });
        //         // const Wards = await ward.find({});
                
        //         // Wards.forEach(ward =>  {
        //         //         console.log(ward.wardID);
        //         //         ward.beds.forEach(bed => {
        //         //             if(bed.bedstatus === "free")
        //         //             {
        //         //                 console.log(bed);
        //         //             }
        //         //         })    
        //         //  });
        //         res.send({WardID, Beds});
        // } catch (e) {
        //     res.status(500).send(e);
        // }
        res.render('hospital/allot-bed');
});

// Allot bed to patient (TO BE DONE)
router.post('/allot-bed', async (req, res) => {
            try{    
                    // Get Ward by wardID
                    const Ward = await ward.findOne({wardID: req.body.wardID});
                   
                    // TO access beds by Array Index
                    const bedIndex = req.body.bedID - 1;

                    // Update bedStatus 
                    Ward.beds[bedIndex].bedstatus = "occupied";
                    Ward.beds.patientID = req.body.patientID;
                    Ward.beds.patientName = req.body.patientName;
                    Ward.beds.attendentName = req.body.attendentName;                    
                   
                    // find returns first bed that matches the bedID
                    // const Bed =  Ward.beds.find( ({bedID}) => bedID === req.body.bedID);
                    // Ward.beds[Bed.bedID].bedstatus = "occupied"  ;
                    Ward.save();
                    res.send(Ward);                 
                   
              } catch (e) {
                // Not Found
                res.status(404).send();
            }
});

// ROOMS 

// Add room 
router.post('/add-room', async (req, res) => {
        try{
            const rooms = await room.find({});
            // Already existing rooms count for generating Room ID
            const len = rooms.length+1;

           // Obj Destructuring
            const {type, details, status, patientID, patientName, attendentName} = req.body;
                        
            const newRoom = new room({id: len, type, details, status, patientID, patientName, attendentName});
           // Save new Room to DB
            await newRoom.save();
            res.status(201).send("Room Saved");
        } catch(e) {
            console.log(e);
        res.status(400).send(e);
    }
}); 

// Get Rooms List
router.get('/rooms', async (req, res) => {
    // try{
    //     const rooms = await room.find({});
    //     const len = rooms.length;
    //     if (!len) {
    //         return res.status(404).send()
    //     }
    //     res.send(rooms);
    // } catch (e) {
    //     // Internal Server Error
    //     res.status(500).send();
    // }
    res.render('hospital/rooms');
    
});

// Get Add Room Page
router.get('/rooms/add-room', async (req, res) => {   
    res.render('hospital/add-room');    
});

// Get Edit Room Page
router.get('/rooms/edit-room', async (req, res) => {
  
    res.render('hospital/edit-room');
    
});

// Get Edit Room Page
router.get('/rooms/allot-room', async (req, res) => {
  
    res.render('hospital/allot-room');
    
});

//Edit Room
router.patch('/rooms/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['type', 'details', 'status', 'patientID', 'patientName', 'attendentName', 'allotedFrom'];
                            
    const isValidOperation = updates.every( (update) => 
                            allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'});
    }
    // const {wardName, bedCapacity, wardStatus} = req.body;
    try {
            const doc = await room.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}); 

           await doc.save(); 
           res.send(doc);
            
    }  catch (e) {
        //Internal Server Error
        res.status(400).send(e);
    }
});


// Delete Room by id
router.delete('/rooms/:id', async (req, res) => {
    try { 
            // Get num (id) of room being deleted
            const doc = await room.findById(req.params.id);
            if (!doc)
                {
                    // Not Found
                    return res.status(404).send();
                }
            const docNum = doc.id;
           
            // Delete Account
            await room.findByIdAndDelete(req.params.id);                

            // Decrement nums(id) by one of all rooms below deleted room
            await room.updateMany({"id" : {$gt: docNum}}, {$inc: {id: -1}});
            
            // Status 410 = Deleted
            res.status(410).send();
        } catch (e) {
        res.status(400).send(e);
    }
});

// Delete All Rooms
router.delete('/rooms', async (req, res) => {
    try {
        const doc = await room.deleteMany();     
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

// Get Rooms that are free (status === "free")
router.get('/allot-room', async (req, res) => {
        try {
                   const freeRooms = await room.find({status: "free"});
                   res.send(freeRooms);
        } catch (e) {
            res.status(500).send(e);
        }
});

// Allot Room to patient (TO BE DONE)
router.post('/allot-room', async (req, res) => {
            try{    
                    // Get Room by Room ID
                    const Room = await room.findOneAndUpdate({id: req.body.id}, {
                                                            status: "occupied", 
                                                            patientName: req.body.patientName,
                                                            attendentName: req.body.attendentName,
                                                            allotedFrom: req.body.allotedFrom
                                                            }, 
                                                            {new: true, runValidators: true});
                res.send("Room Alloted");
               } catch (e) {
                // Not Found
                res.status(404).send(e);
            }
});

// ASSETS

//Add Asset
router.post('/add-asset', async (req, res) => {
    try{
        console.log(req.body);
    //     const assets = await asset.find({});
    //     // Already existing rooms count for generating Room ID
    //     const len = assets.length+1;

    //    // Obj Destructuring
    //     const {name, user, purchaseDate, warrenty, warrentyEnd, amount, status} = req.body;
                    
    //     const newAsset= new asset({id: len, name, user, purchaseDate, warrenty, warrentyEnd, amount, status});
    //    // Save new Room to DB
    //     await newAsset.save();
    //     res.status(201).send("Asset Saved");
    } catch(e) {
        console.log(e);
    res.status(400).send(e);
}
});


// Get Assets List
router.get('/assets', async (req, res) => {
    // try{
    //     const assets = await asset.find({});
    //     const len = assets.length;
    //     if (!len) {
    //         return res.status(404).send("No Assets");
    //     }
    //   res.render('assets');
    // } catch (e) {
    //     // Internal Server Error
    //     res.status(500).send();
    // }
    res.render('hospital/assets');
});

router.get('/assets/add-asset', async (req, res) => {
    // try{
    //     const assets = await asset.find({});
    //     const len = assets.length;
    //     if (!len) {
    //         return res.status(404).send("No Assets");
    //     }
    //   res.render('assets');
    // } catch (e) {
    //     // Internal Server Error
    //     res.status(500).send();
    // }
    res.render('hospital/add-asset');
});


// ROOM
//Edit Room
router.patch('/rooms/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['type', 'details', 'status', 'patientID', 'patientName', 'attendentName', 'allotedFrom'];
                            
    const isValidOperation = updates.every( (update) => 
                            allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'});
    }
    // const {wardName, bedCapacity, wardStatus} = req.body;
    try {
            const doc = await room.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}); 

           await doc.save(); 
           res.send(doc);
            
    }  catch (e) {
        //Internal Server Error
        res.status(400).send(e);
    }
});


// Delete Room by id
router.delete('/rooms/:id', async (req, res) => {
    try { 
            // Get num (id) of room being deleted
            const doc = await room.findById(req.params.id);
            if (!doc)
                {
                    // Not Found
                    return res.status(404).send();
                }
            const docNum = doc.id;
           
            // Delete Account
            await room.findByIdAndDelete(req.params.id);                

            // Decrement nums(id) by one of all rooms below deleted room
            await room.updateMany({"id" : {$gt: docNum}}, {$inc: {id: -1}});
            
            // Status 410 = Deleted
            res.status(410).send();
        } catch (e) {
        res.status(400).send(e);
    }
});

// Delete All Rooms
router.delete('/rooms', async (req, res) => {
    try {
        const doc = await room.deleteMany();     
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

// Get Rooms that are free (status === "free")
router.get('/allot-room', async (req, res) => {
        try {
                   const freeRooms = await room.find({status: "free"});
                   res.send(freeRooms);
        } catch (e) {
            res.status(500).send(e);
        }
});

// Allot Room to patient (TO BE DONE)
router.post('/allot-room', async (req, res) => {
            try{    
                    // Get Room by Room ID
                    const Room = await room.findOneAndUpdate({id: req.body.id}, {
                                                            status: "occupied", 
                                                            patientName: req.body.patientName,
                                                            attendentName: req.body.attendentName,
                                                            allotedFrom: req.body.allotedFrom
                                                            }, 
                                                            {new: true, runValidators: true});
                res.send("Room Alloted");
               } catch (e) {
                // Not Found
                res.status(404).send(e);
            }
});



module.exports = router;
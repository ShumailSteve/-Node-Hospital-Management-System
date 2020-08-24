const express = require('express');
const router = new express.Router();
const ward = require('../models/ward');
const room = require('../models/room');
const asset = require('../models/asset');


router.get('/wards', (req, res) => {
    res.render('hospital/wards');
});

router.get('/wards/add-ward', (req, res) => {
    res.render('hospital/add-ward');
});

router.get('/wards/edit-ward', (req, res) => {
    res.render('hospital/edit-ward');
});

router.get('/ward-details', (req, res) => {
    res.render('hospital/ward-details');
});


router.get('/allot-bed', (req, res) => {
    res.render('hospital/allot-bed');
});

router.get('/wards/edit-bed', (req, res) => {
    res.render('hospital/edit-bed');
});

router.get('/wards/edit-ward', (req, res) => {
    res.render('hospital/edit-ward');
});


// Get wards list
// router.get('/wards', async (req, res) => {
//     try{
//         const wards = await ward.find({});
//         const len = wards.length;
//         if (!len) {
//             return res.status(404).send()
//         }
//         res.render('wards');
//         // res.send(wards);
//     } catch (e) {
//         // Internal Server Error
//         res.status(500).send();
//     }
// });

//Get Ward by ID
router.get('/wards/:id', async (req, res) => {
    try{
        const doc = await ward.findById(req.params.id)
        // If No ward exists with given id
        if (!doc) {
            return res.status(404).send();
        }
        res.send(doc);
    } catch (e) {
        // Bad request
        res.status(400).send(e);
    }
});

// Add ward 
router.post('/wards', async (req, res) => {
        try{
            const wards = await ward.find({});
            // Already existing wards count for generating wardID
            const len = wards.length+1;

           // Obj Destructuring
            const {wardName, bedCapacity, wardStatus } = req.body;
                        
            const newWard = new ward({wardID: len, wardName, bedCapacity, wardStatus });
           
            var ID = 1;
            // Run loop (bedCapacity) times
            for (i=0; i < bedCapacity; i++) {
                    // Push bedID = ID to beds array and increments 
                    newWard.beds.push({"bedID": ID++});
                }       
            // Save newWard to ward collection
            await newWard.save();
            res.status(201).send("Ward Saved");
        } catch(e) {
            console.log(e);
        res.status(400).send(e);
    }
        
});


//Edit ward
router.patch('/wards/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['wardName', 'bedCapacity', 'wardStatus'];
                            
    const isValidOperation = updates.every( (update) => 
                            allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'});
    }
    const {wardName, bedCapacity, wardStatus} = req.body;
    try {
            const doc = await ward.findById(req.params.id); 

        // If bedCapacity update required 
        if(bedCapacity || bedCapacity == 0 ) 
        {
                 // Current bed Capacity
            var currentCap = doc.bedCapacity;
        
             // If bedCapacity is increased in update                                                        
           if(doc.bedCapacity < bedCapacity)
           {    
                                // No. of Beds to increase
               const inc = bedCapacity - currentCap;
              
               // Add new Beds
               for (i=0; i < inc; i++) {

                   // Push bedID = ID to beds array and increments 
                    doc.beds.push({"bedID": ++currentCap});
                 }   
           }
           else{
                 // No. of Beds to decrease
               const dec = currentCap - bedCapacity;
                              
               // Delete beds from array
               for (i=0; i < dec; i++) {
                // Removes last elements from array
                doc.beds.pop();
                 }   
           }
        }
           doc.wardName = wardName;
           doc.bedCapacity = bedCapacity;
           doc.wardStatus = wardStatus;
           await doc.save(); 
           res.send(doc);
            
    }  catch (e) {
        //Internal Server Error
        res.status(400).send(e);
    }
});

// Delete by id
router.delete('/wards/:id', async (req, res) => {
    try {
              const id = req.params.id;
            // Get num of account being deleted
            const doc = await ward.findById(id);
            if (!doc)
                {
                    // Not Found
                    return res.status(404).send();
                }
            const docNum = doc.wardID;
           
            // Delete Account
            await ward.findByIdAndDelete(id);                

            // Decrement nums by one of all accounts below deleted account
            await ward.updateMany({"wardID" : {$gt: docNum}}, {$inc: {wardID: -1}});
            
            // Status 410 = Deleted
            res.status(410).send();
        } catch (e) {
        res.status(400).send(e);
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
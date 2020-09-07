const express = require('express');
const router = new express.Router();

const department = require('../models/department');

// // Get all Departments
// router.get('', (req, res) => {
//         res.render('departments/departments');
// });

// Get ADD Page
router.get('/add-department', (req, res) => {
    res.render('departments/add-department');
});


// // Get Edit Page
// router.get('/edit-department', (req, res) => {
//     res.render('departments/edit-department');
// });

//Get all Departments
router.get('', async (req, res) => {
    res.render('departments/departments');
//     try {
//         const departments = await department.find();
//         const len  = departments.length;
//         // If no departments in db
//         if (!len) {
//             return res.status(404).send();
//         }
      

//    } catch (e) {
//    res.status(500).send();
// }
});

// Get by ID
router.get('/:id', async (req, res) => {
        try{
            
            const dep = await department.findById(req.params.id);
            if(!dep){
                // Not Foundd
                return res.status(404).send();
            } 
            res.status(200).send(dep);
        }catch (e) {
            res.status(400).send();
        }
});

//Add Department
router.post('/add-department', async (req, res) => {
   
        const departments = await department.find();
        const len  = departments.length+1;
    
        const {name, status } = req.body;
        try {
        const newDepartment = new department({id: len, name, status});
        await newDepartment.save();
        res.status(201).send();

   } catch (e) {
   res.status(500).send(e);
}
});

//Edit by ID
router.patch('/:id', async (req, res) => {
        const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'status'];
                            
    const isValidOperation = updates.every( (update) => 
                            allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'});
    }

   
    try {
            const dept = await department.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});                                                         
           
            // If no department in DB
            if (!dept) {
                return res.status(404).send();
            }
            res.send(dept);
    }  catch (e) {
        //Internal Server Error
        res.status(500).send(e);
    }
});

//Delete All
router.delete('/', async (req, res) => {
    try{
         const dept = await department.deleteMany();
        if (dept.deletedCount == 0) {
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
            const dept = await department.findById(id);
            if (!dept)
                {
                    // Not Found
                    return res.status(404).send();
                }
            const deptID = dept.id;
           
            // Delete Account
            await department.findByIdAndDelete(id);                

            // Decrement nums by one of all accounts below deleted account
            await department.updateMany({"id" : {$gt: deptID}}, {$inc: {id: -1}});
            
            // Status 410 = Deleted
            res.status(410).send();
        } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;
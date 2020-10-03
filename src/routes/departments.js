const express = require('express');
const router = new express.Router();

const department = require('../models/department');

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

// Get ADD Page
router.get('/add-department', (req, res) => {
    res.render('departments/add-department');
});

// Edit Department 
router.get('/edit-department/:id', async (req, res) => {
            let errors= [];
            try{
                const Dept = await department.findById(req.params.id);
                 if (!Dept) return res.render('error-400');

                errors.push({msg: req.flash('msg')});
                res.render('departments/edit-department', {Dept, errors});
            } catch {
                res.render('error-500');
            }
});

//Get all Departments
router.get('', async (req, res) => {
            try {
                const departments = await department.find({});
                const len  = departments.length;
                // If no departments in db
                if (!len) {
                    return res.render('departments/departments', {info_msg: "No department available"});                
                }
                res.render('departments/departments', {departments, info_msg: req.flash('msg')});
            } catch {
            res.render('error-500');
            }
});

//Add Department
router.post('/add-department', async (req, res) => {
            const departments = await department.find({});
            const len  = departments.length+1;
            const newDepartment = new department({  id: len, 
                                                    name: req.body.name, 
                                                    status: req.body.status
                                                }); 
            let errors = [];
            // If any required field is empty
            if(!req.body.name || !req.body.status)
            {
                errors.push({msg: "Please fill all required fields"});
                res.render('departments/add-department', {errors, newDepartment});
                return;
            }   

            try { 
            await newDepartment.save();
            req.flash('msg', `${newDepartment.name} Department added successfully`);
            res.redirect('/departments');
            } catch {
            res.render('error-500');
            }
});

//Edit by ID
router.patch('/:id', async (req, res) => {
            let errors = [];
             if(!req.body.name || !req.body.status)
            {
                req.flash('msg', 'Please fill all required Fields');
                res.redirect(`/departments/edit-department/${req.params.id}`);
                return;
            }   
            const updates = Object.keys(req.body);
            const allowedUpdates = ['name', 'status'];                      
            const isValidOperation = updates.every( (update) => 
                                    allowedUpdates.includes(update));

            if (!isValidOperation) {
                return res.redirect('/departments');
            }   
            try {
                    const dept = await department.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});                                                         
                    // If no department in DB
                    if (!dept) {
                        return res.render('error-400');
                    }
                    req.flash('msg', "Department Detaills Updated");
                    res.redirect(`/departments`);
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
                const dept = await department.findById(id);
                if (!dept)
                    {
                        // Not Found
                        return res.render('error-400');
                    }
                const deptID = dept.id;
            
                // Delete Account
                await department.findByIdAndDelete(id);                

                // Decrement nums by one of all accounts below deleted account
                await department.updateMany({"id" : {$gt: deptID}}, {$inc: {id: -1}});
                
                // Status 410 = Deleted
                req.flash('msg', 'Department Deleted Successfully');
                res.redirect(`/departments`);
            } catch (e) {
            res.status(400).send(e);
        }
});

//Delete All
router.delete('', async (req, res) => {
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

 
module.exports = router;
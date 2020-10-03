const express = require('express');
const router = new express.Router();

//Employee Model
const Employee = require('../models/employee');

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

// Get all employees
router.get('', async (req, res) => {
            // If query request
            let query = searchQuery(req);
            const url = "/employees";
            try{
                const employees = await query.exec();
                const len = employees.length;

                // If no Employee
                if (!len) {                   
                        return res.render('employees/employees', {info_msg: "No employee available"});                   
                }
                res.render('employees/employees', {employees, success_msg: req.flash('msg')});            
            } catch  {
                // Internal Server Error
                res.status(500).render('error-500');
            }
});

// Get Employee Profile
router.get('/profile/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        // If no employee exists with given id
        if (!employee)  {
                //404 = Not Found
            return res.render('error-404');
        }
       res.render('employees/profile', {employee});
    } catch (e) {
        // Internal Server Error
        res.render('error-500');
    }
});



// Add employees Page
router.get('/add-employee', (req, res) => {
    //Find Cities
    //Find Role
    res.render('employees/add-employee');
});


// Edit employees page
router.get('/edit-employee/:id', async (req, res) => {
            try{
                    const employee = await Employee.findById(req.params.id);
                    // Not found
                    if(!employee) {
                        return res.render('error-404');
                    }
                    res.render('employees/edit-employee', {employee})
            } catch {
                    //Internal Server Error
                    res.render('error-500');
            }
});

//Add Employee
router.post('/add-employee', async (req, res) => {
                 // Obj Destructuring            
                 const {firstName, lastName, email, gender, address, city, phone, role, joiningDate, dutyDays, availableFrom, availableTill, basicSalary, otherExpenses, status } = req.body;

                 const employees = await Employee.find({});
                 // For generating ID
                 const len = employees.length + 1;

                 const newEmployee = Employee({id: len, firstName, lastName, email, gender, address, city, phone, role, joiningDate, dutyDays, availableFrom, availableTill, basicSalary, otherExpenses, status});
                 let errors = [];

                // If required Fields are empty
                if(!firstName || !email || !gender || !address || !city || !phone || !role) {
                        errors.push({msg: 'Please fill all required fields'});
                       return res.render('employees/add-employee', {
                            errors,
                            employee: newEmployee,
                        });
                }
                try{      
                    await newEmployee.save();
                    res.redirect('/employees');
            } catch (e) {
                    // Bad request
                    res.status(400).send(e);
            }
});



// Edit Emp
router.patch('/:id', async (req, res) => {
            const updates = Object.keys(req.body);
                
            const allowedUpdates = ['firstName', 'lastName', 'email', 'gender', 'address', 'city', 'phone', 'role', 'joiningDate',
                                    'dutyDays', 'availableFrom', 'availableTill', 'basicSalary', 'otherExpenses', 'status' ];
                                    
            const isValidOperation = updates.every( (update) => 
                                    allowedUpdates.includes(update));
            
            if (!isValidOperation) {
            return res.redirect('/employees');
            }
                  
            try {
                    const employee =  await Employee.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
                    // Not Found
                    if (!employee) {               
                    return res.render('error-404');
                    }
                    req.flash('msg', `Employee ${employee.id} Edited Successfully` );
                    res.redirect('/employees');
            }
            catch  {
                //Internal Server Error
                res.render('error-500');
            } 
            
});

// Delete Single Emp
router.delete('/:id', async (req, res) => {
            try {
                    const id = req.params.id;
                    // Get num of account being deleted
                    const doc = await Employee.findById(id);

                    // Not Found
                    if (!doc)
                        {
                            return res.render('error-404');
                        }
                    const docNum = doc.id;
                
                    // Delete Account
                    await Employee.findByIdAndDelete(id);                

                    // Decrement nums by one of all accounts below deleted account
                    await Employee.updateMany({"id" : {$gt: docNum}}, {$inc: {id: -1}});
                    
                    req.flash('msg', "Delete Successfully");
                    res.redirect('/employees');
                } catch (e) {
                        console.log(e);
            }
});

//Delete All Employees
router.delete('/', async (req, res) => {
        try {
            const doc = await Employee.deleteMany();     
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


//  SALARY
router.get('/salary', async (req, res) => {
                let query = searchQuery(req);
                let url = '/employees/salary'
                const employees = await query.exec();
                if(!employees) {
                    return res.render('employees/salary', {info_msg: "No Employees Available"});
                }
                res.render('employees/salary', {employees});
});

router.get('/salary/:id', async (req, res) => {
            const employee = await Employee.findById(req.params.id);

            // Not Found
            if(!employee) {
                return res.render('error-404');
            }
            const date = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ];
            const month = monthNames[date.getMonth()];
            const year = new Date().getFullYear();
            const totalSalary = employee.basicSalary + employee.otherExpenses;
            res.render('employees/salary-view', {employee, month, year, totalSalary});
});



function searchQuery(req) {
            let query =  Employee.find();
            if(req.query.name != null && req.query.name !== "") {
                query = query.regex('firstName', new RegExp(req.query.name, 'i'));
            }
            if(req.query.joinedBefore != null && req.query.joinedBefore !== "") {
                query = query.lte('joiningDate', req.query.joinedBefore );
            }
            if(req.query.joinedAfter != null && req.query.joinedAfter !== "") {
                query = query.gte('joiningDate', req.query.joinedAfter );
            }
            if(req.query.role != null && req.query.role !== "" && req.query.role !== "Select Role") {
                query = query.regex('role', new RegExp(req.query.role));
            }
           return query;
} 

module.exports = router;



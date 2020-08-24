const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');

//Employee Model
const employee = require('../models/employee');

// Get employees page
router.get('', (req, res) => {
    res.render('employees/employees');
});

// Add employees page
router.get('/add-employee', (req, res) => {
    res.render('employees/add-employee');
});


// Edit employees page
router.get('/edit-employee', (req, res) => {
    res.render('employees/edit-employee');
});

//Get Salary
router.get('/salary', (req, res) => {
    res.render('employees/salary');
});

//Get Add Salary
router.get('/salary/add-salary', (req, res) => {
    res.render('employees/add-salary');
});

//Get Edit Salary
router.get('/salary/edit-salary', (req, res) => {
    res.render('employees/edit-salary');
});

//Salary View
router.get('/salary/salary-view', (req, res) => {
    res.render('employees/salary-view');
});


// Get all employees
router.get('', async (req, res) => {
        try{
                const employees = await employee.find({});
                const len = employees.length;

                if (!len) {
                          return res.status(404).send();
                }
                res.send(employees);
        } catch (e) {
                res.status(404).send();
        }
});

// Get Single Employee by ID
router.get('/:id', async (req, res) => {
    try {
        const emp = await employee.findById(req.params.id);
        if (!emp)  {
                //status 404 = Not Found
            return res.status(404).send();
        }
       res.send(emp);
    } catch (e) {
        // Bad Request
        res.status(400).send(e);
    }
});

// Get Single Employee by email and pass
router.post('/employee', async (req, res) => {
    try {
        const emp = await employee.findOne({email: req.body.email});
        if (!emp)  {
                //status 404 = Not Found
            return res.status(404).send("email doesn't exists");
        }
        const isMatch = await bcrypt.compare(req.body.pass, emp.password);
        // If pass doesn't match
        if(!isMatch){
            return res.status(400).send("Incorrect Pass");
        }
       res.send(emp);
    } catch (e) {
        // Bad Request
        res.status(400).send(e);
    }
 
});


//Add Employee
router.post('/add-employee', async (req, res) => {
        try{     
            
            const employees = await employee.find();
           
            // For generating ID
            const len = employees.length + 1;
            
            //Parse Date
            const joiningDate = JSON.parse(req.body.joiningDate);
            
            // Obj Destructuring            
            const {firstName, lastName, username, email, password, password2, age, gender, 
                    dutyDays, dutyTime, address, phone, educationDetails, role, status } = req.body;
            if(password != password2){
                return res.status(400).send("Pass mismatch");
            }
            //Hash Pass before saving to db
            const hashedPass = await bcrypt.hash(password, 8);
            const newEmployee = new employee({id: len, firstName, lastName, username, email, password: hashedPass, age, joiningDate, gender, 
                                                dutyDays, dutyTime, address, phone, educationDetails, role, status });
            
            await newEmployee.save();
            // Created
            // res.status(201).send();
            res.redirect('http://localhost:3000/add-salary');
    } catch (e) {
            // Bad request
            res.status(400).send(e);
    }
});



// Edit Emp
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
           
    const allowedUpdates = ['firstName', 'lastName', 'username', 'email', 'password', 'age', 'gender', 'joiningDate', 
                            'dutyDays', 'dutyTime', 'address','phone', 'educationDetails', 'role','status'];
                            
    const isValidOperation = updates.every( (update) => 
                             allowedUpdates.includes(update));
    
    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'});
    }
      // // Parse incoming Dates
             // if joiningDate update required
     if(req.body.joiningDate) {
            const joinDate = JSON.parse(req.body.joiningDate);
            req.body.joiningDate = joinDate;
         }
               
    try {
            const user =  await employee.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
            if (!user) {
               // Not Found
               return res.status(404).send();
            }
            res.send(user);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

// Delete Single Emp
router.delete('/:id', async (req, res) => {
    try {
              const id = req.params.id;
            // Get num of account being deleted
            const doc = await employee.findById(id);
            if (!doc)
                {
                    // Not Found
                    return res.status(404).send();
                }
            const docNum = doc.id;
           
            // Delete Account
            await employee.findByIdAndDelete(id);                

            // Decrement nums by one of all accounts below deleted account
            await employee.updateMany({"id" : {$gt: docNum}}, {$inc: {id: -1}});
            
            // Status 410 = Deleted
            res.status(410).send();
        } catch (e) {
        res.status(400).send(e);
    }
});

//Delete All Employees
router.delete('/', async (req, res) => {
        try {
            const doc = await employee.deleteMany();     
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




module.exports = router;



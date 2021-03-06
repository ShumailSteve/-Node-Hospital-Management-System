require('dotenv').config()

const express = require('express');
const Port = process.env.PORT || 3000;
const hbs = require('hbs');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

const app = express();
app.use(methodOverride('_method'));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// Express Session Middleware
app.use(session({
    secret: 'secret',
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
}))

app.use(cookieParser());

//Enable Flash Middleware
app.use(flash());

// Connect to Database
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false  });

const db = mongoose.connection

db.on('error', (error) => console.error(error) );
db.once('open',  () => console.log('connected to DB'));

// Require Routes
const indexRouter = require('./src/routes/index');
const doctorsRouter = require('./src/routes/doctors');
const patientsRouter = require('./src/routes/patients');
const appointmentsRouter = require('./src/routes/appointments');
const departmentsRouter = require('./src/routes/departments');
const employeesRouter = require('./src/routes/employees');
const adminRouter = require("./src/routes/admins");
const hospitalRouter = require("./src/routes/hospital");

// Define Paths for Express Config.
const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname, './public/templates/views');
const partialsPath = path.join(__dirname, './public/templates/partials');

// Set up Static Directory Path
app.use(express.static(publicDirectoryPath));

// Set up handlersbar engine and views Location
app.set('view engine', 'hbs');
app.set('views', viewsPath);

hbs.registerPartials(partialsPath);

// Helper to check two values are equal
hbs.registerHelper('if_eq', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

// Helper to check if value exists in array
hbs.registerHelper('if_includes', function(arr, val, opts) {
    // If arr is defined
    if(arr != undefined) {
        const found =  arr.includes(val);
        // If True
        if(found)
            return opts.fn(this);
        //Else
        return opts.inverse(this);
    }        
});

// Add Routers 
app.use('', indexRouter);
app.use('/doctors', doctorsRouter);
app.use('/patients', patientsRouter);
app.use('/appointments', appointmentsRouter);
app.use('/departments', departmentsRouter);
app.use('/employees', employeesRouter);
app.use('/admin', adminRouter);
app.use('/hospital', hospitalRouter);



app.get('/test', (req, res) => {
    res.render('test');
});

app.get('/error-404', (req, res) => {
    res.render('error-404');
});

app.get('/error-500', (req, res) => {
    res.render('error-500');
});

app.get('*', (req, res) => {
    res.render('error-404');
});

app.listen(Port, () => {
    console.log(`Server Up on Port ${Port}`);
});


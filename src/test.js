// const jwt = require('jsonwebtoken');

// const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn:
//     '7 days' })

//     console.log({token});


//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log({data});
require('dotenv').config();
const nodemailer = require("nodemailer");

  
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD, 
    }
    // ,
    // tls: {
    //   rejectUnauthorized: false
    });


  let mailOptions = {
    from: 'shumailsteve@gmail.com', // sender address
    to: "k164021@nu.edu.pk", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
   
    html: "<b>Hello world?</b>", // html body
  }

  transporter.sendMail(mailOptions).then( data => {
    console.log("SENT");
  }).catch (e => console.log(e));
    
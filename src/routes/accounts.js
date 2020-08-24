const express = require('express');
const router = new express.Router();

//Invoice Model
const invoice = require('../models/invoice');

// Get all Invoices
router.get('/invoices', async (req, res) => {
        // try{
        //         const invoices = await invoice.find({});
        //         const len = invoices.length;

        //         if (!len) {
        //                   return res.status(404).send();
        //         }
        //         res.send(invoices);
        // } catch (e) {
        //         res.status(404).send();
        // }
        res.render('accounts/invoices');
});

// Get Create Invoice Page
router.get('/invoices/create-invoice', async (req, res) => {
      res.render('accounts/create-invoice');
});

// Get Edit Invoice Page
router.get('/invoices/edit-invoice', async (req, res) => {
    res.render('accounts/edit-invoice');
});

// Get View Invoice Page
router.get('/invoices/invoice-view', async (req, res) => {
    res.render('accounts/invoice-view');
});


// Get Single Employee by ID
router.get('invoices/:id', async (req, res) => {
    try {
        const Invoice = await invoice.findById(req.params.id);
        if (!Invoice)  {
                //status 404 = Not Found
            return res.status(404).send();
        }
       res.send(Invoice);
    } catch (e) {
        // Bad Request
        res.status(400).send(e);
    }
});

//Create Invoice
router.post('/create-invoice', async (req, res) => {
        try{   
            console.log(req.body);
            res.send("Submitted")
    } catch (e) {
            // Bad request
            res.status(400).send(e);
    }
});

// PAYMENTS

// Get payments
router.get('/payments', async (req, res) => {
    res.render('accounts/payments');
});




module.exports = router;



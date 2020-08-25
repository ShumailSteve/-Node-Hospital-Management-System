const express = require('express');
const router = new express.Router();

//Get Requests
router.get('', (req, res) => {
    res.render('index');
});

router.get('/index', (req, res) => {
        res.render('index');
});

module.exports = router;
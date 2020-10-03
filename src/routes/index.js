const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');

//Get Requests
router.get('', auth, (req, res) => {
    res.render('index');
});

router.get('/index', auth, (req, res) => {
        res.render('index');
});

module.exports = router;
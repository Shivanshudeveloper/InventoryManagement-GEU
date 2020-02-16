// Bring Exrpess
const express = require('express');
const router = express.Router();
// Ensure Authentication
const { ensureAuthenticatedFaculty } = require('../config/auth');

// Main Login Page for the Faculty
router.get('/', (req, res) => {
    res.render('./faculty_module/main');
});

// Registration Page Faculty
router.get('/register', (req, res) => {
    res.render('./faculty_module/register');
});

// Registration Page Faculty
router.get('/dashboard', ensureAuthenticatedFaculty, (req, res) => {
    req.session.name = req.user.name;
    req.session.email = req.user.email;
    req.session.userType = req.user.type;
    req.session.userId = req.user.id;
    req.session.phone = req.user.phone;
    res.render('./faculty_module/dashboard', {
        name: req.session.name,
        userType: req.user.type
    });
});


// Exporting Module
module.exports = router
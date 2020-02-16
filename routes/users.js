// Bring Exrpess
const express = require('express');
const router = express.Router();

/**
 * @ All Modules are exported here
 */

// User Module
const User = require('../models/Users');
// Faculty Module
const Faculty_Module = require('../models/Faculty');
// Vendor Module
const Vendor_Module = require('../models/Vendors');

// Bcrypt for password encryption 
const bcrypt = require('bcryptjs');
// Passport for authentication
const passport = require('passport');


// Registration Page
router.get('/register', (req, res) => {
    res.render('register');
});


// Faculty Registration Handler
router.post('/registerFaculty', (req, res) => {
    const { name, email, phone, department, password, password2 } = req.body
    let errors = [];
    if (!name || !email || !phone || !department || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }
    // Password Check
    if (password !== password2) {
        errors.push({ msg: 'Password dose not match' })
    }
    // Password Length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 character' })
    }
    if (errors.length > 0) {
        res.render('./faculty_module/register', {
          errors,
          name,
          email,
          phone,
          department,
          password,
          password2
        });
    } else {
        User.findOne( {"$or" : [{email : email}]} )
            .then(user => {
                if (user) {
                    errors.push({ msg: `Email already exist` })
                    res.render('./faculty_module/register', {
                        errors,
                        name,
                        email,
                        phone,
                        department,
                        password,
                        password2
                    })
                }
                else {
                    const newUser = new User({
                        name,
                        email,
                        phone,
                        password,
                        type: "faculty"
                    })
                    const newFaculty = new Faculty_Module({
                        name,
                        email,
                        phone,
                        department,
                    })
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // Set Password to hash
                        newUser.password = hash
                        // Save User
                        newUser.save()
                            .then(user => {
                                newUser.save()
                                    .then(() => {
                                        req.flash('success_msg', 'Please Verify Your Email')
                                        res.redirect('/faculty')
                                    })
                                    .catch(err => console.log(err))
                            })
                            .catch(err => console.log(err))
                    }))
                }
        })
    }
});


// Register Handler
router.post('/register', (req, res) => {
    const { name, email, phone, address, password, password2 } = req.body
    let errors = [];
    if (!name || !email || !phone || !address || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }
    // Password Check
    if (password !== password2) {
        errors.push({ msg: 'Password dose not match' })
    }
    // Password Length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 character' })
    }

    if (errors.length > 0) {
        res.render('register', {
          errors,
          name,
          email,
          phone,
          password,
          password2
        });
    } else {
        User.findOne( {"$or" : [{email : email}]} )
            .then(user => {
                if (user) {
                    errors.push({ msg: `Email already exist` })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        phone,
                        address,
                        password,
                        password2
                    })
                }
                else {
                    const vendorUser = new Vendor_Module({
                        vendor_name: name,
                        address,
                        email,
                        phone
                    })
                    const newUser = new User({
                        name,
                        email,
                        phone,
                        password,
                        type: "vendor"
                    })
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // Set Password to hash
                        newUser.password = hash
                        // Save User
                        newUser.save()
                            .then(user => {
                                vendorUser.save()
                                    .then(() => {
                                        req.flash('success_msg', 'Please Verify Your Email')
                                        res.redirect('/')
                                    })
                                    .catch(err => console.log(err))
                            })
                            .catch(err => console.log(err))
                    }))
                }
        })
    }
});




// Login Faculty Handler
router.post('/loginFaculty', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/faculty/dashboard',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next)
});
// LogOut Handle
router.get('/logoutFaculty', (req, res) => {
    req.logOut()
    res.redirect('/faculty')
});




// Login Handler
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next)
});
// LogOut Handle
router.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
});

// Exporting Module
module.exports = router
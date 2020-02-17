// Bring Exrpess
const express = require('express');
const router = express.Router();
// Ensure Authentication
const { ensureAuthenticatedFaculty } = require('../config/auth');

/**
 * @ All Modules Imported
 */
// Requirements for Item
const Requirements_Model = require('../models/RequirementItem');



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

// Request for Goods
router.get('/goods-request-form', ensureAuthenticatedFaculty, (req, res) => {
    res.render('./faculty_module/goods-request-form', {
        name: req.session.name,
        userType: req.session.userType
    });
});



/**
 * @ All Post Requests Send
 */

 router.post('/sendrequirementsitems', ensureAuthenticatedFaculty, (req, res) => {
    const userId = req.session.userId;
    const {request_by, purpose, item, specification} = req.body;
    let errors = [];
    if (!request_by || !purpose || !item || !specification ) {
        errors.push({ msg: 'Please enter all fields' });
    } 
    if (errors.length > 0) {
        res.render('goods-request-form', {
          name: req.session.name,
          userType: req.session.userType,
          errors
        });
    }
    else {
        const requirements = new Requirements_Model({
            request_by,
            request_by_id: userId,
            purpose,
            item,
            specification,
            approved: false,
            rejected: false
        });
        requirements.save()
            .then(() => {
                req.flash('success_msg', 'Request Made Successfully')
                res.redirect('/faculty/goods-request-form');
            })
            .catch(err => console.log(err));
    }
 });

// Exporting Module
module.exports = router
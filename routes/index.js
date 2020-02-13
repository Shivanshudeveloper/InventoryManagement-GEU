// Bring Exrpess
const express = require('express');
const router = express.Router();
// Ensure Authentication
const { ensureAuthenticated } = require('../config/auth');


// Models Imported
// Goods Module
const GoodPurchasedForm_Model = require('../models/GoodsRequestForm');
// Vendors Module
const Vendors_Model = require('../models/Vendors');


// Home Main Page
router.get('/', (req, res) => {
    res.render('main');
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    req.session.name = req.user.name;
    req.session.email = req.user.email;
    req.session.userType = req.user.type;
    req.session.userId = req.user.id;
    req.session.phone = req.user.phone;
    res.render('dashboard', {
        name: req.session.name,
        userType: req.user.type
    });
});

// Goods Request Form
router.get('/goods-request-form', ensureAuthenticated, (req, res) => {
    res.render('goods-request-form', {
        name: req.session.name,
        userType: req.session.userType
    });
});

// All Goods Request
router.get('/all-goods-request', ensureAuthenticated, (req, res) => {
    GoodPurchasedForm_Model.find({})
        .then(goods => {
            res.render('all-goods-request', {
                name: req.session.name,
                userType: req.session.userType,
                goods: goods
            });
        })
        .catch(err => console.log(err));
});

// Edit Goods Request Form
router.get('/editGoodsRequest/:id', ensureAuthenticated, (req, res) => {
    const id = req.params.id;
    GoodPurchasedForm_Model.findOne({ '_id': id})
        .then(goods => {
            var id = goods.id,
                title = goods.title,
                vendor_name = goods.vendor_name,
                address = goods.address,
                purchase_order_number = goods.purchase_order_number,
                quotation_details = goods.quotation_details,
                product_purchased_details = goods.product_purchased_details,
                attachment_URL = goods.attachment_URL;
            res.render('editGoodsRequest', {
                name: req.session.name,
                userType: req.session.userType,
                title,
                vendor_name,
                address,
                purchase_order_number,
                quotation_details,
                product_purchased_details,
                attachment_URL,
                id
            });
        })
        .catch(err => console.log(err));
});

// Registar All Goods Approve
router.get('/goods-requests', ensureAuthenticated, (req, res) => {
    if (req.session.userType != 'registar') {
        res.redirect('/dashboard');
    } else {
        GoodPurchasedForm_Model.find({approved: false})
        .then(goods => {
            res.render('goods-requests', {
                name: req.session.name,
                userType: req.session.userType,
                goods: goods
            });
        })
        .catch(err => console.log(err));
    }
});

// Registar Disapproved
router.get('/disapproved/:id', ensureAuthenticated, (req, res) => {
    const id = req.params.id;
    GoodPurchasedForm_Model.updateOne( {'_id': id }, {
        $set: {
            rejected: true
        }
    })
    .then(() => {
        req.flash('success_msg', 'Approved Successfully')
        res.redirect(`/goods-requests`);
    })
    .catch(err => console.log(err));
});

// All Approved Goods
router.get('/approved', ensureAuthenticated, (req, res) => {
    GoodPurchasedForm_Model.find({approved: true})
        .then(goods => {
            res.render('approved-goods', {
                name: req.session.name,
                userType: req.session.userType,
                goods: goods
            });
        })
        .catch(err => console.log(err));
});

// All Rejected Goods
router.get('/rejectedGoods', ensureAuthenticated, (req, res) => {
    GoodPurchasedForm_Model.find({rejected: true})
        .then(goods => {
            res.render('rejectedGoods', {
                name: req.session.name,
                userType: req.session.userType,
                goods: goods
            });
        })
        .catch(err => console.log(err));
});


// Vendors Page
router.get('/vendors', ensureAuthenticated, (req, res) => {
    Vendors_Model.find({})
        .then(vendors => {
            res.render('vendors', {
                name: req.session.name,
                userType: req.session.userType,
                vendors
            });
        })
        .catch(err => console.log(err));
});


/**
 * @ POST Request
 */

// Goods Request Form
router.post('/goodsrequest', ensureAuthenticated, (req, res) => {
    const {vendorname, title, address, purchaseordernumber, quotationdetails, productpurchased_details, attachment_URL} = req.body;
    let errors = [];
    if (!vendorname || !title || !address || !purchaseordernumber || !quotationdetails || !productpurchased_details) {
        errors.push({ msg: 'Please enter all fields' });
    } 
    if (errors.length > 0) {
        res.render('goods-request-form', {
          vendorname,
          errors,
          title,
          address,
          purchaseordernumber,
          quotationdetails,
          productpurchased_details,
          name: req.session.name,
          userType: req.session.userType
        });
    }


    else {
        const goodsPurchased = new GoodPurchasedForm_Model({
            title,
            vendor_name: vendorname,
            address,
            purchase_order_number: purchaseordernumber,
            quotation_details: quotationdetails,
            product_purchased_details: productpurchased_details,
            attachment_URL,
            approved: false,
            rejected: false
        });
        goodsPurchased.save()
            .then(() => {
                req.flash('success_msg', 'You Goods Form Submitted Successfully')
                res.redirect('/goods-request-form');
            })
            .catch(err => console.log(err));
    }
});

// Delete request for Goods
router.post('/deleteRequest/:id', ensureAuthenticated, (req, res) => {
    const id = req.params.id;
    GoodPurchasedForm_Model.deleteOne( { '_id': id } )
        .then(() => {
            req.flash('info_msg', 'You Goods Request Deleted Successfully')
            res.redirect('/all-goods-request');
        })
        .catch(err => console.log(err))
});

// Update Goods Request Form
router.post('/updateGoodRequestForm/:id', ensureAuthenticated, (req, res) => {
    const id = req.params.id;
    const {vendorname, title, address, purchaseordernumber, quotationdetails, productpurchased_details, attachment_URL} = req.body;
    let errors = [];
    if (!vendorname || !title || !address || !purchaseordernumber || !quotationdetails || !productpurchased_details) {
        errors.push({ msg: 'Please enter all fields' });
    } 
    if (errors.length > 0) {
        res.render('goods-request-form', {
          vendorname,
          errors,
          title,
          address,
          purchaseordernumber,
          quotationdetails,
          productpurchased_details,
          name: req.session.name,
          userType: req.session.userType
        });
    }
    else {
        GoodPurchasedForm_Model.updateOne( {'_id': id }, {
            $set: {
                title,
                vendor_name: vendorname,
                address,
                purchase_order_number: purchaseordernumber,
                quotation_details: quotationdetails,
                product_purchased_details: productpurchased_details,
                attachment_URL
            }
        })
        .then(() => {
            req.flash('info_msg', 'Your Request Updated Successfully')
            res.redirect(`/editGoodsRequest/${id}`);
        })
        .catch(err => console.log(err));
    }
});

// Approve the process
router.post('/approvedGoodsRequest/:id', ensureAuthenticated, (req, res) => {
    const id = req.params.id;
    GoodPurchasedForm_Model.updateOne( {'_id': id }, {
        $set: {
            approved: true
        }
    })
    .then(() => {
        req.flash('success_msg', 'Approved Successfully')
        res.redirect(`/goods-requests`);
    })
    .catch(err => console.log(err));
});

// Add Vendor
router.post('/addvendors', ensureAuthenticated, (req, res) => {
    const {name, address, email, phone} = req.body;
    let errors = [];
    if (!name || !address || !email || !phone ) {
        errors.push({ msg: 'Please enter all fields' });
    } 
    if (errors.length > 0) {
        res.render('vendors', {
          name: req.session.name,
          userType: req.session.userType
        });
    }
    else {
        const vendors = new Vendors_Model({
            vendor_name: name,
            address,
            email,
            phone
        });
        vendors.save()
            .then(() => {
                req.flash('success_msg', 'Vendor Successfully Added')
                res.redirect('/vendors');
            })
            .catch(err => console.log(err));
    }
});


// Exporting Module
module.exports = router
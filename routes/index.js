// Bring Exrpess
const express = require('express');
const router = express.Router();
// Ensure Authentication
const { ensureAuthenticated } = require('../config/auth');
// Nodemailer
const nodemailer = require('nodemailer');

// Models Imported
// Goods Module
const GoodPurchasedForm_Model = require('../models/GoodsRequestForm');
// Vendors Module
const Vendors_Model = require('../models/Vendors');
// Quatation Model
const Quatation_Model = require('../models/Quatation');


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

// Send to Vendor
router.get('/sendvendors/:id', ensureAuthenticated, (req, res) => {
    let goodsArr = [];
    const id = req.params.id;
    GoodPurchasedForm_Model.findOne({_id: id})
        .then((goods) => {
            goodsArr.push(goods);
            res.render('sendvendor', {
                name: req.session.name,
                userType: req.session.userType,
                goodsArr
            });
        })
        .catch(err => console.log(err));
});

// Send to all Vendors
router.get('/sendtoallvendors/:id', ensureAuthenticated, (req, res) => {
    var emails = '';
    const goodsId = req.params.id;
    Vendors_Model.find({})
        .then(vendors => {
            vendors.forEach((vendor) => {
                emails = emails + vendor.email + ',';
            })
            emails = emails.substring(0, emails.length-1);
            // Send Emails to Everyone
            GoodPurchasedForm_Model.findOne({_id: goodsId})
                .then((goods) => {
                    const output = `
                        <h1>Graphic Era Deemed to be University Goods Request</h1>
                        <h3>Details:</h3>
                        <ul>
                            <li>Title: ${goods.title}</li>
                            <li>Address: ${goods.address}</li>
                            <li>Purchase Order Number: ${goods.purchase_order_number}</li>
                            <li>Quatation Details: ${goods.quotation_details}</li>
                            <li>Product Purchased Details: ${goods.product_purchased_details}</li>
                            <li>Download Attachment: <a href="${goods.attachment_URL}" download>Download Attachment</a></li>
                        </ul>
                        <a href="http://localhost:5000/">Submit Your Quataion</a>
                        <h3>In case of any query please contact to the Adminstration</h3>
                    `;
                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'akhilnegigeu@gmail.com',
                            pass: 'work@1234'
                        }    
                    });
                    // send mail with defined transport object
                    let info = transporter.sendMail({
                        from: 'akhilnegigeu@gmail.com', // sender address
                        to: emails, // list of receivers
                        subject: "Request for Goods", // Subject line
                        text: "Goods Request", // plain text body
                        html: output // html body
                    }).then(() => {
                        req.flash('success_msg', 'Mail Send Successfully')
                        res.redirect(`/sendvendors/${goodsId}`);
                    })
                    .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
                // Send Email to Everyone
        })
        .catch(err => console.log(err));
});

// For Vendors Goods Request Page
router.get('/goodsrequestsvendors', ensureAuthenticated, (req, res) => {
    if (req.session.userType != 'vendor') {
        res.redirect('/dashboard');
    } else {
        GoodPurchasedForm_Model.find({})
        .then(goods => {
            res.render('goodsrequestsvendors', {
                name: req.session.name,
                userType: req.session.userType,
                goods
            });
        })
        .catch(err => console.log(err));
    }
});

// Submit Quatation for the Goods
router.get('/submitquatation/:id', ensureAuthenticated, (req, res) => {
    const goodsId = req.params.id;
    let goodsArr = [];
    if (req.session.userType != 'vendor') {
        res.redirect('/dashboard');
    } else {
    GoodPurchasedForm_Model.findOne({ _id: goodsId })
        .then(goods => {
            goodsArr.push(goods);
            res.render('submit-quatation-form', {
                name: req.session.name,
                email: req.session.email,
                phone: req.session.phone,
                userType: req.session.userType,
                goodsArr
            });
        })
        .catch(err => console.log(err));        
    }
});

// All Quatations Send
router.get('/quatations-send', ensureAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const userType = req.session.userType;
    if (userType == 'admin') {
        Quatation_Model.find({})
            .then(quatations => {
                res.render('all-quatations-send', {
                    name: req.session.name,
                    userType: req.session.userType,
                    quatations
                });
            })
            .catch(err => console.log(err));
    } else if (userType == 'vendor') {
        Quatation_Model.find({ vendorId: userId })
            .then(quatations => {
                res.render('all-quatations-send', {
                    name: req.session.name,
                    userType: req.session.userType,
                    quatations
                });
            })
            .catch(err => console.log(err));
    } else {
        res.redirect('/dashboard');
    }
    
    
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
          userType: req.session.userType,
          errors
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

// Mail Send to Vendor for Request
router.post('/sendrequestvendor/:id', ensureAuthenticated, (req, res) => {
    const goodsId = req.params.id;
    var emailVendor = req.body.email;
    // Replacing all the Whitespaces
    emailVendor = emailVendor.replace(/\s/g,'');

    GoodPurchasedForm_Model.findOne({_id: goodsId})
        .then((goods) => {
            const output = `
                <h1>Graphic Era Deemed to be University Goods Request</h1>
                <h3>Details:</h3>
                <ul>
                    <li>Title: ${goods.title}</li>
                    <li>Address: ${goods.address}</li>
                    <li>Purchase Order Number: ${goods.purchase_order_number}</li>
                    <li>Quatation Details: ${goods.quotation_details}</li>
                    <li>Product Purchased Details: ${goods.product_purchased_details}</li>
                    <li>Download Attachment: <a href="${goods.attachment_URL}" download>Download Attachment</a></li>
                </ul>
                <a href="http://localhost:5000/">Submit Your Quataion</a>
                <h3>In case of any query please contact to the Adminstration</h3>
            `;
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                       user: 'akhilnegigeu@gmail.com',
                       pass: 'work@1234'
                   }    
            });
            // send mail with defined transport object
            let info = transporter.sendMail({
                from: 'akhilnegigeu@gmail.com', // sender address
                to: emailVendor, // list of receivers
                subject: "Request for Goods", // Subject line
                text: "Goods Request", // plain text body
                html: output // html body
            }).then(() => {
                console.log("Send Email Message Successfully");
                req.flash('success_msg', 'Mail Send Successfully')
                res.redirect(`/sendvendors/${goodsId}`);
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// Send Quataion Request
router.post('/sendquatation/:id', ensureAuthenticated, (req, res) => {
    const goodsId = req.params.id;
    const vendorname = req.body.vendorname,
          purpose = req.body.purpose,
          email = req.body.email,
          phone = req.body.phone,
          vendorId = req.session.userId,
          attachment_URL = req.body.attachment_URL;

    let errors = [];
    let goodsArr = [];
    if (!vendorname || !purpose || !attachment_URL || !email || !phone ) {
        errors.push({ msg: 'Please enter all fields' });
    } 
    if (errors.length > 0) {
        GoodPurchasedForm_Model.findOne({ _id: goodsId })
        .then(goods => {
            goodsArr.push(goods);
            res.render('submit-quatation-form', {
                name: req.session.name,
                email: req.session.email,
                phone: req.session.phone,
                userType: req.session.userType,
                goodsArr,
                errors
            });
        })
        .catch(err => console.log(err));
    }
    else {
        Quatation_Model.countDocuments({vendorId: vendorId, goodsId: goodsId})
            .then(count => {
                if (count > 0) {
                    req.flash('info_msg', 'You Have Already Submitted the Quatation')
                    res.redirect(`/submitquatation/${goodsId}`);
                } else {
                    const quatation = new Quatation_Model({
                        vendorId,
                        vendor_name: vendorname,
                        purpose,
                        email,
                        phone,
                        goodsId,
                        quatation_URL: attachment_URL
                    });
                    quatation.save()
                        .then(() => {
                            req.flash('success_msg', 'Quatation Successfully Send')
                            res.redirect(`/submitquatation/${goodsId}`);
                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    }
});


// Delete the Quatation Request
router.post('/deleteQuatationRequest/:id', ensureAuthenticated, (req, res) => {
    const id = req.params.id;
    Quatation_Model.deleteOne( { '_id': id } )
        .then(() => {
            req.flash('info_msg', 'You Quatation Deleted Successfully')
            res.redirect('/quatations-send');
        })
        .catch(err => console.log(err))
});


// Exporting Module
module.exports = router
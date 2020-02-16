// Bring Exrpess
const express = require('express');
const router = express.Router();
// Ensure Authentication
const { ensureAuthenticated } = require('../config/auth');
// Nodemailer
const nodemailer = require('nodemailer');
// Excel
const xl = require('excel4node');
// Create a new instance of a Workbook class
/**
 * Can be use in future prespective for generation of excel reports
 */
const wb = new xl.Workbook();
// Path Module
const path = require('path');

// DOT ENV File configuration requirement
require('dotenv').config();

// Models Imported
// Goods Module
const GoodPurchasedForm_Model = require('../models/GoodsRequestForm');
// Vendors Module
const Vendors_Model = require('../models/Vendors');
// Quatation Model
const Quatation_Model = require('../models/Quatation');
// Requirements
const Requirements_Model = require('../models/RequirementItem');


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
    Requirements_Model.find({})
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
    Requirements_Model.findOne({ '_id': id})
        .then(goods => {
            var id = goods.id,
                request_by = goods.request_by,
                purpose = goods.purpose,
                item = goods.item,
                specification = goods.specification;
                
            res.render('editGoodsRequest', {
                name: req.session.name,
                userType: req.session.userType,
                request_by,
                purpose,
                item,
                specification,
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
        Requirements_Model.find({approved: false, rejected: false})
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
    Requirements_Model.updateOne( {'_id': id }, {
        $set: {
            rejected: true
        }
    })
    .then(() => {
        req.flash('success_msg', 'Disapproved Successfully')
        res.redirect(`/goods-requests`);
    })
    .catch(err => console.log(err));
});

// All Approved Goods
router.get('/approved', ensureAuthenticated, (req, res) => {
    Requirements_Model.find({approved: true})
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
    Requirements_Model.find({rejected: true})
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
    Requirements_Model.findOne({_id: id})
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

    const userName = req.session.name,
          userPhone = req.session.phone;

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newdate = year + "/" + month + "/" + day;

    Vendors_Model.countDocuments({})
        .then(count => {
            if (count < 1) {
                req.flash('error_msg', 'You have not register any vendor please add vendor first')
                res.redirect(`/sendtovendorpurchaseorder/${goodsId}`);
            } else {
                Vendors_Model.find({})
                    .then(vendors => {
                        vendors.forEach((vendor) => {
                            emails = emails + vendor.email + ',';
                        })
                        emails = emails.substring(0, emails.length-1);
                        // Send Emails to Everyone
                        Requirements_Model.findOne({_id: goodsId})
                            .then((goods) => {
                                const output = `
                                    <h1>Graphic Era Deemed to be University Goods Request</h1>
                                    <h3>Details:</h3>
                                    <ul>
                                        <li>Date: ${newdate}</li>
                                        <li>Purpose: ${goods.purpose}</li>
                                        <li>Request By: ${goods.request_by}</li>
                                        <li>Item: ${goods.item}</li>
                                        <li>Specification: ${goods.specification}</li>
                                    </ul>
                                    <a href="https://management-cloud-geu.azurewebsites.net/">Submit Your Quataion</a>
                                    <p>
                                        Regards,
                                        ${userName}
                                        Mob: ${userPhone}
                                    </p>
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
                                    subject: `Quatation Required for ${goods.item}`, // Subject line
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
            }
        })
        .catch(err => console.log(err));

    
});


// Purchase Order Send to All Vendor
router.get('/sendtoallvendorspurchaseorder/:id', ensureAuthenticated, (req, res) => {
    var emails = '';
    const goodsId = req.params.id;

    const userName = req.session.name,
          userPhone = req.session.phone;

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newdate = year + "/" + month + "/" + day;

    Vendors_Model.countDocuments({})
        .then(count => {
            console.log(count);
            if (count < 1) {
                req.flash('error_msg', 'You have not register any vendor please add vendor first')
                res.redirect(`/sendtovendorpurchaseorder/${goodsId}`);
            } else {
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
                                    <p>Date: ${newdate}</p>
                                    <h3>Dear Sir:</h3>
                                    <p>The following details are required kindly please look at the followings.</p>
                                    <ul>
                                        <li>Title: ${goods.title}</li>
                                        <li>Quatation Details: ${goods.quotation_details}</li>
                                        <li>Product Purchase Details: ${goods.product_purchased_details}</li>
                                        <li>
                                        <a href="${goods.attachment_URL}" download target="_blank" rel="noopener noreferrer">
                                            Download Attachment
                                        </a>
                                        </li>
                                    </ul>
                                    <a target="_blank" href="https://management-cloud-geu.azurewebsites.net/">Submit Your Quataion</a>
                                    <p>
                                        Regards,
                                        ${userName}
                                        Mob: ${userPhone}
                                    </p>
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
                                    subject: `Quatation Required for ${goods.item}`, // Subject line
                                    text: "Goods Request", // plain text body
                                    html: output // html body
                                }).then(() => {
                                    req.flash('success_msg', 'Mail Send Successfully')
                                    res.redirect(`/sendtovendorpurchaseorder/${goodsId}`);
                                })
                                .catch(err => console.log(err));
                            })
                            .catch(err => console.log(err));
                            // Send Email to Everyone
                    })
                    .catch(err => console.log(err));
            }
        })  
        .catch(err => console.log(err));

    
});

// For Vendors Goods Request Page
router.get('/goodsrequestsvendors', ensureAuthenticated, (req, res) => {
    if (req.session.userType != 'vendor') {
        res.redirect('/dashboard');
    } else {
        Requirements_Model.find({})
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
    Requirements_Model.findOne({ _id: goodsId })
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

// Purchase Order
router.get('/purchase-order', ensureAuthenticated, (req, res) => {
    GoodPurchasedForm_Model.find({})
        .then(goods => {
            res.render('purchase-order', {
                name: req.session.name,
                userType: req.session.userType,
                goods
            });
        })
        .catch(err => console.log(err));
});


router.get('/sendtovendorpurchaseorder/:id', ensureAuthenticated, (req, res) => {
    const purchaseId = req.params.id;
    let goodsArr = [];
    GoodPurchasedForm_Model.findOne({_id: purchaseId})
        .then(allgoods => {
            goodsArr.push(allgoods);
            res.render('purchaseorder-sendvendor', {
                name: req.session.name,
                userType: req.session.userType,
                goodsArr
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
                res.redirect('/purchase-order');
            })
            .catch(err => console.log(err));
    }
});

// Delete request for Goods
router.post('/deleteRequest/:id', ensureAuthenticated, (req, res) => {
    const id = req.params.id;
    Requirements_Model.deleteOne( { '_id': id } )
        .then(() => {
            req.flash('info_msg', 'You Goods Request Deleted Successfully')
            res.redirect('/all-goods-request');
        })
        .catch(err => console.log(err))
});

// Update Goods Request Form
router.post('/updateGoodRequestForm/:id', ensureAuthenticated, (req, res) => {
    const id = req.params.id;
    const {purpose, request_by, item, specification} = req.body;
    let errors = [];
    if (!purpose || !request_by || !item || !specification) {
        errors.push({ msg: 'Please enter all fields' });
    } 
    if (errors.length > 0) {
        res.render('goods-request-form', {
          purpose,
          request_by,
          item,
          specification,
          name: req.session.name,
          userType: req.session.userType
        });
    }
    else {
        Requirements_Model.updateOne( {'_id': id }, {
            $set: {
                purpose,
                request_by,
                item,
                specification,
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
    Requirements_Model.updateOne( {'_id': id }, {
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

    const userName = req.session.name,
          userPhone = req.session.phone;

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newdate = year + "/" + month + "/" + day;

    Requirements_Model.findOne({_id: goodsId})
        .then((goods) => {
            const output = `
                <h1>Graphic Era Deemed to be University Goods Request</h1>
                <h3>Details:</h3>
                <ul>
                    <li>Date: ${newdate}</li>
                    <li>Purpose: ${goods.purpose}</li>
                    <li>Item Name: ${goods.item}</li>
                    <li>Specification: ${goods.specification}</li>
                </ul>
                <a target="_blank" href="https://management-cloud-geu.azurewebsites.net/">Submit Your Quataion</a>
                <p>
                    Regards,
                    ${userName}
                    Mob: ${userPhone}
                </p>
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


// Requirements Form
router.post('/sendrequirementsitems', ensureAuthenticated, (req, res) => {
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
            purpose,
            item,
            specification,
            approved: false,
            rejected: false
        });
        requirements.save()
            .then(() => {
                req.flash('success_msg', 'Requirements Successfully Submitted')
                res.redirect('/goods-request-form');
            })
            .catch(err => console.log(err));
    }
});

router.post('/purchaseordersendrequestvendor/:id', ensureAuthenticated, (req, res) => {
    const goodsId = req.params.id;
    var emailVendor = req.body.email;
    // Replacing all the Whitespaces
    emailVendor = emailVendor.replace(/\s/g,'');

    const userName = req.session.name,
          userPhone = req.session.phone;
    
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newdate = year + "/" + month + "/" + day;


    GoodPurchasedForm_Model.findOne({_id: goodsId})
        .then((goods) => {
            const output = `
                <h1>Graphic Era Deemed to be University Goods Request</h1>
                <p>Date: ${newdate}</p>
                <h3>Dear Sir:</h3>
                <p>The following details are required kindly please look at the followings.</p>
                <ul>
                    <li>Title: ${goods.title}</li>
                    <li>Quatation Details: ${goods.quotation_details}</li>
                    <li>Product Purchase Details: ${goods.product_purchased_details}</li>
                    <li>
                    <a href="${goods.attachment_URL}" download target="_blank" rel="noopener noreferrer">
                        Download Attachment
                    </a>
                    </li>
                </ul>
                <a target="_blank" href="https://management-cloud-geu.azurewebsites.net/">Submit Your Quataion</a>
                <p>
                    Regards,
                    ${userName}
                    Mob: ${userPhone}
                </p>
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
                subject: "Purchase Order", // Subject line
                text: "Goods Request", // plain text body
                html: output // html body
            }).then(() => {
                console.log("Send Email Message Successfully");
                req.flash('success_msg', 'Mail Send Successfully')
                res.redirect(`/sendtovendorpurchaseorder/${goodsId}`);
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));


});



/**
 * @ Search Fields
 */

// Search Fields for Goods
router.post('/searchgoods', ensureAuthenticated, (req, res) => {
    const { search } = req.body;
    let goods = [];
    GoodPurchasedForm_Model.findOne( { title: search } )
    .then(good => {
        goods.push(good);
        if (goods[0] == null) {
            res.render('all-goods-request', {
                name: req.session.name,
                userType: req.session.userType,
                goods: goods
            });
        } else {
            res.render('all-goods-request', {
                name: req.session.name,
                userType: req.session.userType,
                goods: goods
            });
        }
    })
    .catch(err => console.log(err));
});



// Search Fields for Quatatin
router.post('/searchquatation', ensureAuthenticated, (req, res) => {
    const { search } = req.body;
    let quatations = [];
    Quatation_Model.findOne( { purpose: search } )
    .then(quatation => {
        quatations.push(quatation);
        if (quatations[0] == null) {
            res.render('all-quatations-send', {
                name: req.session.name,
                userType: req.session.userType,
                quatations
            });
        } else {
            res.render('all-quatations-send', {
                name: req.session.name,
                userType: req.session.userType,
                quatations
            });
        }
        
    })
    .catch(err => console.log(err));
});


// Excel File Export All Goods Request
router.get("/exportExcel", (req, res) => {
    GoodPurchasedForm_Model.find({})
        .then(goods => {
            res.json(goods);
        })
        .catch(err => console.log(err));
});

// Email Verification Link Page Route Redirection
router.get('/emailverification', (req, res) => {
    res.sendFile(path.join(__dirname + '/emailVerification.html'));
});

// Exporting Module
module.exports = router
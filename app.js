// Express
const express = require('express');
// Express Layouts
const expressLayouts = require('express-ejs-layouts');
// MongoDB
const mongoose = require('mongoose');
// Express Session
const session = require('express-session');
// Passport
const passport = require('passport');
// Path Module
const path = require('path');
// Flash
const flash = require('connect-flash');

// Initializing app
const app = express();

// Passport Configuration File
require('./config/passport')(passport);

// DB Connection
const db = require('./config/keys').MongoURI;
// Connect MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then( () => console.log('MongoDB Connected') )
    .catch(err => console.log(err))

// For Static Files
app.use(express.static(path.join(__dirname, 'public')));

// BodyParser
app.use(express.urlencoded({ extended: false }) )

// EJS Middleware
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

// Middleware Flash
app.use(flash());
// Globar Varivale
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.info_msg = req.flash('info_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Passport MiddleWare
app.use(passport.initialize());
app.use(passport.session());

// Setting Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// Getting PORT set
const PORT = process.env.PORT || 5000;

// Starting the server
app.listen(PORT, console.log('Server Started On Port', PORT));
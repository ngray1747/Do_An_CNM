var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var session = require('express-session');
var passport = require('passport');
var flash = require('express-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var nodemailer = require('nodemailer');
var index = require('./routes/index');
var localStorage = require('localStorage');
var helpers = require('handlebars-helpers')();

/*var users = require('./routes/users');
*/
var routes = require('./routes/index');
var userRoutes = require('./routes/user');

// localStorage.clear();
//mongoose.connect('localhost:27017/project_cnm');
mongoose.connect('mongodb://root:root@ds237717.mlab.com:37717/project_cnm');

require('./config/passport');

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
    console.log("Connection succeeded.");
});

var app = express();

// view engine setup
/*app.set('views', path.join(__dirname, 'views'));*/
app.engine('.hbs',expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret',
  resave:false,
  saveUninitialized:false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: { maxAge:180 * 60 * 1000}
}));
app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRoutes);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

email_transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'duyychiha9@gmail.com',
        pass: '12345677a'
    }
});


module.exports = app;

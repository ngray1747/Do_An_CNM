var passport = require('passport');
var User = require('../model/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err,user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req,email, password,done){
  req.checkBody('email','Invalid email').notEmpty().isEmail();
  req.checkBody('password','Invalid password').notEmpty().isLength({min:6});
  var errors = req.validationErrors();
  var name = req.body.name;
  if(errors) {
    var messages= [];
    errors.forEach(function(error){
        messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
      User.findOne({'email':email}, function(err,user){
        if(err){
          return done(err);
        }
        if(user){
          return done(null, false, {message: 'email to already to use'});
        }
        var newUser = new User();
        newUser.name = name;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result){
            if(err){
              return done(err);
            }
            return done(null, newUser);
        });
    });
}));



passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password,done){
  req.checkBody('email','Invalid email').notEmpty().isEmail();
  req.checkBody('password','Invalid password').notEmpty();
  var errors = req.validationErrors();
  if(errors) {
    var messages= [];
    errors.forEach(function(error){
        messages.push(error.msg);
    });
    return done(null, false, req.flash('Error!', messages));
  }

  User.findOne({'email':email}, function(err,user){
    if(err){
      return done(err);
    }
    if(!user){
      return done(null, false, {message: 'User not found!'});
    }
    if(!user.validPassword(password)){
      return done(null, false, {message: 'Password is incorrect!'});
    }

    return done(null, user);
});


}));
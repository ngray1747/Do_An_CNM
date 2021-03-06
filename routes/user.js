var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var request = require('request');
var localStorage = require('localStorage');
var bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended:false});
var bodyParser = require('body-parser');
var csrfProtection = csrf();
var flash = require('express-flash');
var util = require("util");

//router.use(csrfProtection);

// router.get('/profile', function(req,res,next){
// 	res.render('user/profile');
// });
router.get('/logout',isLoggedIn, function(req, res,next){
  localStorage.clear();
 
  res.redirect('/user/signin');
});

router.get('/dashboard',isLoggedIn, function(req, res,next){

  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/user-dashboard';
  var data = {
    balance_address: localStorage.getItem('address')
  };
  console.log(data);
  request.post({url,form:data},function(err,httpResponse,body){
    var datas = JSON.parse(body);
    if (datas.status === 0) {
      return(false);
    }

      res.render('dashboard/dashboard',{ layout: false,username:datas.data.name,usable_balance: datas.data.usable_balance,current_balance: datas.data.current_balance,transaction_address : datas.data.address});
  });

});


router.get('/signup', function(req,res,next){
	var messages = req.flash('error');
	res.render('user/signup');
});


router.post('/signup',function(req,res,next){
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/register';
  var data = {
    email:req.body.email,
    name:req.body.name,
     password:req.body.password
  };
  request.post({url,form:data},function(err,httpResponse,body){
    var datas = JSON.parse(body);
    if (datas.status === 0) {
      req.session.sessionFlash = {
        type: 'danger',
        message: datas.message
    }
      res.redirect('/user/signup');
      return;
    }
    res.redirect('/user/signin');
  });
});



router.get('/signin',function(req,res,next){
  var messages = req.flash('error');
	res.render('user/signin');
});

router.get('/super-dashboard',isLoggedIn,function(req,res,next){
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/getadmindashboard';
  var data = {
    address:localStorage.getItem('address')
  };
  console.log(data);
  request.post({url,form:data},function(err,httpResponse,body){
    var datas = JSON.parse(body);
    console.log(datas);
    if (datas.status == 0) {
      req.session.sessionFlash = {
        type: 'danger',
        message: datas.message
      }
      res.redirect('/user/signin');
        return;
      }
    res.render('dashboard/admin/dashboard',{layout:false,number_of_user:datas.data.number_of_user,system_current:datas.data.actual,system_usable:datas.data.available});
    
  });

});

router.get('/transactions-history',isLoggedIn,function(req,res,next){
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/get-user-trans';
  var data = {
    address:localStorage.getItem('address')
  };
  console.log(data);
  request.post({url,form:data},function(err,httpResponse,body){
    var datas = JSON.parse(body);
    console.log('Get user transactions : '+ datas);
    if (datas.status == 0) {
      req.session.sessionFlash = {
        type: 'danger',
        message: datas.message
      }
      res.redirect('/user/dashboard');
        return;
      }
    res.render('dashboard/history',{layout:false,data:datas.data});
    
  });

});



router.get('/super-users',isLoggedIn,function(req,res,next){
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/getuserinfo';
  var data = {
    address:localStorage.getItem('address')
  };
  console.log(data);
  request.post({url,form:data},function(err,httpResponse,body){
    var datas = JSON.parse(body);
    console.log('Get super user : '+ datas);
    if (datas.status == 0) {
      req.session.sessionFlash = {
        type: 'danger',
        message: datas.message
      }
      res.redirect('/user/signin');
        return;
      }
    res.render('dashboard/admin/users',{layout:false,data:datas.data});
    
  });

});

router.get('/super-transactions',isLoggedIn,function(req,res,next){
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/getalltransactions';
  var data = {
    address:localStorage.getItem('address')
  };
  console.log(data);
  request.post({url,form:data},function(err,httpResponse,body){
    var datas = JSON.parse(body);
    console.log(datas);
    if (datas.status == 0) {
      req.session.sessionFlash = {
        type: 'danger',
        message: datas.message
      }
      res.redirect('/user/signin');
        return;
      }
    res.render('dashboard/admin/transactions',{layout:false,data:datas.data});
    
  });

});
router.get('/super-balances/',isLoggedIn,function(req,res,next){
  res.redirect('/user/super-users');
});
router.get('/super-balances/:id',isLoggedIn,function(req,res,next){

    var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/getusertransaction';
    var data = {
      id:req.params.id,
      address:localStorage.getItem('address')
    };
    
    console.log(data);
    request.post({url,form:data},function(err,httpResponse,body){
      var datas = JSON.parse(body);
      console.log('super-balances'+util.inspect(datas.data.transactions));
      if (datas.status == 0) {
        req.session.sessionFlash = {
          type: 'danger',
          message: datas.message
        }
        res.redirect('/user/signin');
          return;
        }
      res.render('dashboard/admin/balances',{layout:false,data:datas.data});
      
    }); 

});



router.post('/signin',function(req,res,next){
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/signin';
  var data = {
    email:req.body.email,
    password:req.body.password
  };
  console.log(data);
  request.post({url,form:data},function(err,httpResponse,body){
    var datas = JSON.parse(body);
    console.log(datas);
    if (datas.status == 0) {
        req.session.sessionFlash = {
          type: 'danger',
          message: datas.message
      }
      res.redirect('/user/signin');
      return;
    }
    localStorage.setItem('address', JSON.parse(body).data.address);
    if (datas.data.is_admin){
      
      res.redirect('/user/super-dashboard');
    }else{
      res.redirect('/user/dashboard');
    }
  });
});

router.post('/dashboard',function(req,res,next){
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/create-transaction';
  var data = {
    send_address:req.body.send_address,
    receive_address:req.body.receive_address,
    amount : req.body.amount
  };
  request.post({url,form:data},function(err,httpResponse,body){
    var datas = JSON.parse(body);
    console.log(datas);
    if (datas.status == 0) {
      req.session.sessionFlash = {
        type: 'danger',
        message: datas.message
    }
      res.redirect('/user/dashboard');
      return;
    }
    res.redirect('/user/dashboard');
    
  });
});

router.get('/transactions',isLoggedIn, function(req,res,next){
  
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/gettrans';
  var data = {
  address : localStorage.getItem('address')
  };
  console.log(data);

  request.post({url,form:data},function(err,httpResponse,body){
      var datas = JSON.parse(body);
      console.log('transs:');
      console.log(datas.data.transactions);
  res.render('dashboard/confirm',{layout:false,data:datas.data.transactions,helpers: {
            if_eq: function(a, b, opts) { if(a == b)
            return opts.fn(this);
        else
            return opts.inverse(this); }
}});
  });
});

router.get('/forgotpwd', function(req,res,next){
  var messages = req.flash('error');
  res.render('user/forgotpwd');
});

router.get('/user-confirm/:trans_id', function(req,res,next){
  console.log(req.params.trans_id);
  res.render('user/user-confirm',{transaction_id:req.params.trans_id});
});

router.post('/user-confirm', function(req,res,next){
  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/confirm-transaction';
  var data = {
  password:req.body.password,
  transaction_id : req.body.transaction_id,
  code : req.body.code
  };
  request.post({url,form:data},function(err,httpResponse,body){
  var datas = JSON.parse(body);
  if (datas.status === 0) {
    req.session.sessionFlash = {
      type: 'danger',
      message: datas.message
    }
      res.redirect('/user/signin/');
  }else{
    req.session.sessionFlash = {
      type: 'success',
      message: datas.message
    }
    res.redirect('/user/signin');
  }
  
  });
});

router.post('/forgotpwd',urlencodedParser,function (req,res) {

  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/forgotpwd';
  var data = {
  email:req.body.email
  };
  request.post({url,form:data},function(err,httpResponse,body){
      var datas = JSON.parse(body);
  if (datas.status === 0) {
    req.session.sessionFlash = {
      type: 'danger',
      message: datas.message
  }
      res.redirect('/user/forgotpwd');
      return;
  }
  res.redirect('/user/signin');
  });
});

router.post('/confirm',function (req,res) {

  var url  = 'https://fathomless-headland-51949.herokuapp.com/kcoin-api/delete-transaction';
  var data = {
    transaction_id:req.body.transaction_id

  };
  console.log(data);
  request.post({url,form:data},function(err,httpResponse,body){
      var datas = JSON.parse(body);
  if (datas.status === 0) {
    req.session.sessionFlash = {
      type: 'danger',
      message: datas.message
  }
      res.redirect('/user/dashboard');
  }
  res.redirect('/user/dashboard');
  });
});


function isLoggedIn(req, res, next){
  if(localStorage.getItem('address')){
    return next();
  }
  res.redirect('/user/signin');
}

module.exports = router;
var express = require('express');
var router = express.Router();
var usermodel = require('./users')
var groupmodel = require('./users')
var passport = require('passport')
var localStrategy = require('passport-local')
const ExpressError = require('../utils/expressError')
const { userSchema } = require('../schema')
passport.use(new localStrategy(usermodel.authenticate()))

router.use((req,res,next)=>{
  res.locals.successFlash = req.flash("success")
  res.locals.failureFlash = req.flash("error")
  next()
})


/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
  res.render('index.ejs', { user: req.user });
});

router.get('/register', function (req, res, next) {
  res.render('register.ejs');
});


// router.post('/register',async function (req, res, next) {
//   try {
//     let result = userSchema.validate(req.body);
//     if (result.error) {
//       throw new ExpressError(403, result.error)
//     }
//     const userdets = new usermodel({
//       username: req.body.username,
//       contact: req.body.contact,
//     })
//     usermodel.register(userdets, req.body.password)
//       .then(function (user) {
//         passport.authenticate("local")(req, res, function () {
//           res.redirect("/")
//         })
//       })
//   } catch(err){
//     next(err)
//   }
// });
router.post('/register', async function (req, res, next) {
  try {
    let result = userSchema.validate(req.body);
    if (result.error) {
      throw new ExpressError(403, result.error)
    }
    const userdets = new usermodel({
      username: req.body.username,
      contact: req.body.contact,
      profileimg: req.body.profileimg,
    });
    
    // Await the registration process to complete
    const user = await usermodel.register(userdets, req.body.password);
    passport.authenticate("local")(req, res, function () {
      req.flash('success', 'User Registration Successful! And LoggedIn');
      res.redirect("/")
    });
  } catch(err){
    next(err);
  }
});

router.get('/login', function (req, res, next) {
  res.render('login.ejs');
});

// router.post(
//   '/login',
//   passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//   }),
//   (req, res, next) => { 
//   }
// );

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  (req, res, next) => { 
    req.flash('success', 'Welcome back !');
    res.redirect('/');
  }
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

  




function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  else {
    res.redirect("/login")
  }
}

router.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
})

router.use((err, req, res, next) => {
  // console.log(err)
  let { status = 500, message = "some random error" } = err
  res.status(status).render('error.ejs', { err })
})



module.exports = router;

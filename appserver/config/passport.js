const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const User = require('../models/authentication')

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({
      passReqToCallback: true,
      usernameField: 'account'
    }, (req, account, password, done) => {
      //match User
      User.findOne({
          account: account
        })
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: 'acc is not registered!'
            });
          }
          //match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user, );
            } else {
              return done(null, false, {
                message: 'password incorrect!'
              })
            }
          })
        })
        .catch(err => console.log(err));
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}

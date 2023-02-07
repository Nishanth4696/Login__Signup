/* Passport is authentication middleware for Node.js. we used this to authenticate login request */
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt");
const User = require("./model/user");

let login;

/* The local authentication strategy authenticates users using a username and password. The strategy requires a verify callback,
 which accepts these credentials and calls done providing a user */

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    function (username, password, done) {
      login = { username: username };

      User.findOne(login, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: "Username does match",
          });
        }

        bcrypt.compare(password, user.password, (err, match) => {
          if (err) {
            return done(null, false, { message: "something's wrong" });
          }

          if (!match) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }

          return done(null, user);
        });
      });
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "dhvani-twitter",
    },
    function (jwtPayload, cb) {
      return User.findById(jwtPayload.id)
        .then((user) => {
          return cb(null, user);
        })
        .catch((err) => {
          return cb(err);
        });
    }
  )
);

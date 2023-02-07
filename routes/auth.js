/* this page consist of authentication routes where we able to authenticate users by fetching data to the db and can create users. */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const { getAllUsers, getUser } = require("../controller/auth");
const logger = require("../logger");
const multer = require("multer");
const UploadImage = require("../controller/profile");

// This Router is for handling login request
router.post("/login", function (req, res, next) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      logger.error(err);
      return res.status(400).json({
        msg: info ? info.message : "Login failed",
        user: user,
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.status(400).send(err);
        logger.error(err);
      }

      let userData = {
        id: user._id,
        admin: user.admin,
        username: user.username,
        profile: user.profile,
        followers: user.followers,
        following: user.following,
        membership: user.membership,
      };
      const token = jwt.sign(userData, "dhvani-twitter", {
        expiresIn: 60 * 60 * 120,
      });

      return res.status(201).json({ token, user });
    });
  })(req, res);
});

//This Router is for handling Signup request
router.post("/register", function (req, res, next) {
  // console.log(req.body);
  // UploadImage(req, res, async (error) => {
  //   console.log(req.body);
  //   if (error instanceof multer.MulterError) {
  //     logger.error(error.message);
  //     console.log(error.message);
  //     return res.status(400).json({
  //       message: "Upload unsuccessful",
  //       error: error.message,
  //       errorCode: error.code,
  //     });
  //   }
  //   if (error) {
  //     console.log("errors", error);
  //     res.status(400).json({ error: error });
  //     logger.error(error);
  //   } else {
  //     // If File not found
  //     if (req.files === undefined) {
  //       logger.error("Error: No File Selected!");
  //       res.status(400).json({ error: "Error: No File Selected" });
  //     }
  //   }
  //   let fileArray = req.files,
  //     fileLocation;
  //   console.dir(req.body, "data");

  //   if (fileArray.length > 0) {
  //     fileLocation = fileArray[0].location;
  //   }
  //   console.log(fileLocation);
  const newUser = {
    username: req.body.email,
    name: req.body.name,
    email: req.body.email,
    likes: req.body.likes,
    password: req.body.password,
    // profile: fileLocation,
  };
  //It checks if the email/username is already exist.if not it creates user else it returns error
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        User.findOne({ email: req.body.email })
          .then((user) => {
            if (!user) {
              bcrypt.hash(req.body.password, 10, (err, hash) => {
                newUser.password = hash;
                User.create(newUser)
                  .then(() => res.json({ msg: "created successfully" }))
                  .catch((err) => res.send(err));
              });
            } else {
              console.log("email already exisi");
              res.status(400).send({ msg: "email already used" });
            }
          })
          .catch((err) => res.send(err));
      } else {
        console.log("user already exisi");
        res.status(400).json({ msg: "username already exist" });
      }
    })
    .catch((err) => res.send(err));
});
// }}

router.post("/createuser", (req, res) => {
  const newUser = {
    email: req.body.email,
    username: req.body.email,
  };
  User.find({ email: req.body.email }, function (err, data) {
    if (data.length === 0) {
      User.create(newUser).then(() => {
        User.find({ email: req.body.email }, function (err, data) {
          console.log("user created");
          let userData = {
            id: data[0]._id,
            name: data[0].name,
            email: data[0].email,
            profile: data[0].profile,
            membership: data[0].membership,
          };
          const token = jwt.sign(userData, "dhvani-twitter", {
            expiresIn: 60 * 60 * 120,
          });
          res.status(201).json({ token, data });
        });
      });
    } else {
      let userData = {
        id: data[0]._id,
        name: data[0].name,
        email: data[0].email,
        profile: data[0].profile,
        membership: data[0].membership,
      };
      const token = jwt.sign(userData, "dhvani-twitter", {
        expiresIn: 60 * 60 * 120,
      });
      res.status(201).json({ token, data });
    }
  });
});

router.post("/gettoken", async (req, resp) => {
  User.find({ email: req.body.email }, function (err, data) {
    if (!err) {
      console.log(data);
      let userData = {
        id: data[0]._id,
        name: data[0].name,
        email: data[0].email,
        profile: data[0].profile,
        membership: data[0].membership,
      };
      const token = jwt.sign(userData, "dhvani-twitter", {
        expiresIn: 60 * 60 * 120,
      });
      resp.status(201).json({ token, data });
    } else {
      resp.json(err);
    }
  })
    .clone()
    .catch(function (err) {
      console.log(err);
    });
});
router.put("/updateuser", (req, res) => {
  const newUser = {
    firstname: req.body.name,
    email: req.body.email,
    likes: req.body.likes,
    profile: fileLocation,
  };
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      User.create(newUser).then(() => res.send("User Created"));
    } else {
      res.send("User Already Exist");
    }
  });
});
//Route for upload cover image on profile pae
router.put("/updatecoverimage", (req, res) => {
  UploadImage(req, res, async (error) => {
    const { id, cover } = req.body;
    if (error instanceof multer.MulterError) {
      logger.error(error.message);
      console.log(error.message);
      return res.status(400).json({
        message: "Upload unsuccessful",
        error: error.message,
        errorCode: error.code,
      });
    }
    if (error) {
      console.log("errors", error);
      res.status(400).json({ error: error });
      logger.error(error);
    } else {
      // If File not found
      if (req.files === undefined) {
        logger.error("Error: No File Selected!");
        res.status(400).json({ error: "Error: No File Selected" });
      }
    }
    let fileArray = req.files,
      fileLocation;
    console.dir(req.body, "data");

    if (fileArray.length > 0) {
      fileLocation = fileArray[0].location;
    }
    console.log(fileLocation);
    var myquery = { _id: id };
    var newvalues = { $set: { cover: fileLocation } };
    if (fileLocation) {
      User.findOneAndUpdate(myquery, newvalues, function (err, res) {
        if (err) {
          throw err;
        }
        console.log("1 document updated");
      });
      res.send("succes");
    }
  });
});

router.put("/updateprofileimage", (req, res) => {
  UploadImage(req, res, async (error) => {
    const { id } = req.body;
    if (error instanceof multer.MulterError) {
      logger.error(error.message);
      console.log(error.message);
      return res.status(400).json({
        message: "Upload unsuccessful",
        error: error.message,
        errorCode: error.code,
      });
    }
    if (error) {
      console.log("errors", error);
      res.status(400).json({ error: error });
      logger.error(error);
    } else {
      // If File not found
      if (req.files === undefined) {
        logger.error("Error: No File Selected!");
        res.status(400).json({ error: "Error: No File Selected" });
      }
    }
    let fileArray = req.files,
      fileLocation;
    console.dir(req.body, "data");

    if (fileArray.length > 0) {
      fileLocation = fileArray[0].location;
    }
    console.log(fileLocation);
    var myquery = { _id: id };
    var newvalues = { $set: { profile: fileLocation } };
    if (fileLocation) {
      User.findOneAndUpdate(myquery, newvalues, function (err, res) {
        if (err) {
          throw err;
        }
        console.log("1 document updated");
      });
      res.send("succes");
    }
  });
});

//This Router is used to get all user data
router.get("/allusers/:id", getAllUsers);

router.get("/user/:id", getUser);

module.exports = router;

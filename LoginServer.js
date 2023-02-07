/* This is the main indexpage where we import all the modules we neeeded and routes and database connection */
const express = require("express");
const app = express();
const passport = require("passport");
const cors = require("cors");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const uuid = require("uuid");
const User = require("./model/user");
const multer = require("multer");
const UploadImage = require("./controller/profile");
const logger = require("./logger");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(methodOverride("_method"));
require("./passport");
require("dotenv").config();

app.use(passport.initialize());

// // Database Connection
mongoose.connect(
  "mongodb://localhost:27017",
  {
    dbName: "seiger",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) =>
    err ? logger.error(err) : console.log("Connected to Mongo database")
);

// Route for login and Signup
var authRoute = require("./routes/auth");

app.use("/auth", authRoute);

app.get("/", (req, resp) => {
  resp.send("Seiger Login App is Working");
});

//Get all user data
app.get("/getallusers", async (req, res) => {
  const result = await User.find({});
  res.json(result);
});

app.put("/updateuser", (req, res) => {
  console.log(req.body);
  UploadImage(req, res, async (error) => {
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
    var myquery = { email: req.body.email };
    var newvalues = {
      $set: {
        city: req.body.city,
        name: req.body.name,
        number: req.body.number,
        country: req.body.country,
        membership: req.body.membership,
        profile: fileLocation,
      },
    };
    User.findOneAndUpdate(myquery, newvalues, function (err, resp) {
      if (err) {
        resp.send(err).status(401);
      }
      res.send("success");
      console.log("1 document updated");
    });
  });
});

//--------------------- Get user by ID Function ---------------------//
app.get("/login/get/:id", (req, resp) => {
  let id = req.params.id;
  User.find({ _id: id }, function (err, res) {
    if (err) {
      resp.status(400).send("Error");
    } else {
      resp.send(res);
    }
  });
});

//--------------------- Adding Education Function ---------------------//
app.put("/login/education/:id", async (req, res) => {
  const { degree, field, school, sdate, edate, grade } = req.body;
  let educationDetails = {
    _id: uuid.v4(),
    school: school,
    degree: degree,
    field: field,
    startDate: sdate,
    endDate: edate,
    grade: grade,
  };
  console.log(educationDetails);

  User.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $push: { education: educationDetails },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(401).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

//--------------------- Edit User Function ---------------------//
app.put("/login/edit/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  console.log(data);

  User.findByIdAndUpdate(
    { _id: id },
    {
      $set: data,
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        res.status(402).json({ error: err });
      } else {
        res.json(result);
      }
    }
  );
});

//listen
const server = app.listen(8080, () => {
  console.log("Login Server Started at 8080");
});

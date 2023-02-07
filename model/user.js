/* This is a mongoose Schema used for handling Signup data */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
    username: {
      default: "",
      unique: true,
      type: String,
    },
    name: {
      default: "",
      required: false,
      type: String,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },

    profile: {
      type: String,
    },

    country: String,
    cover: String,
    description: String,
    city: String,
  },
  { timestamps: true }
);
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("Normaluser", userSchema);
module.exports = User;

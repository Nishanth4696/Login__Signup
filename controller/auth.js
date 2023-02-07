/* This Module Contains the GET Request to get all users with specific data */

const logger = require("../logger");
const User = require("../model/user");

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "name",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
    logger.error("Error while getting users from Database");
  }
};

module.exports.getUser = async (req, resp, next) => {
  try {
    let id = req.params.id;
    User.find({ _id: id }, function (err, res) {
      if (err) {
        resp.status(400).send("Error");
      } else {
        resp.send(res);
      }
    });
  } catch (ex) {
    next(ex);
    logger.error("Error while getting users from Database");
  }
};

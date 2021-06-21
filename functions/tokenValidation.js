require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let tokenValidation = async (response, token) => {
  let validationResult = {};

  if (!token) {
    response.send({
      auth: false,
      token: null,
      message: `Not valid token.`,
    });
    return;
  }

  try {
    validationResult = jwt.verify(token, process.env.SECRET_WORD);
  } catch (error) {
    response.send({
      auth: false,
      token: null,
      message: `Not valid token.`,
    });
    return;
  }

  let user = await User.findById(validationResult.id, { password: 0 }).populate(
    "recipes"
  );

  if (!user) {
    response.send({
      auth: false,
      message: "User does not exist.",
    });
    return;
  }

  return user;
};

module.exports = tokenValidation;

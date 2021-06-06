const config = require("../utils/config");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const loginRouter = require("express").Router();

const User = require("../models/user");

loginRouter.post("/", async (request, response, next) => {
  const loginData = request.body;

  try {
    const user = await User.findOne({ username: loginData.username });
    const isPasswordValid = user && await bcrypt.compare(loginData.password, user.passwordHash);

    if (!isPasswordValid) {
      return response.status(401).json({ error: "Invalid username or password" });
    }

    const tokenData = {
      username: user.username,
      id: user._id
    };

    const token = jwt.sign(tokenData, config.SECRET, { expiresIn: 60 * 60 });

    response
      .status(200)
      .json({
        name: user.name,
        username: user.username,
        token
      });
  } catch (error) {
    next(error);
  }
});

module.exports = loginRouter;
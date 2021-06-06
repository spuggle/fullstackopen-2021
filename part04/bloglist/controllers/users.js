const bcrypt = require("bcrypt");
const userRouter = require("express").Router();

const User = require("../models/user");

userRouter.get("/", async (reqeust, response) => {
  const users = await User
    .find({})
    .populate("blogs", { title: 1, author: 1, url: 1 });

  response.json(users);
});

userRouter.post("/", async (request, response, next) => {
  const providedData = request.body;

  try {
    if (!providedData.password || (providedData.password.length < 3)) {
      return response.status(400).json({ error: "Password is too short" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(providedData.password, saltRounds);

    const user = new User({
      name: providedData.name,
      username: providedData.username,
      passwordHash
    });

    const savedUser = await user.save();

    response.json(savedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = userRouter;
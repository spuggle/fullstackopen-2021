const config = require("./utils/config");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const blogRouter = require("./controllers/blogs");
const middleware = require("./utils/middleware");

const app = express();

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogRouter);

app.use(middleware.handleError);

module.exports = app;
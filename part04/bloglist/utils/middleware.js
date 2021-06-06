const config = require("../utils/config");

const jwt = require("jsonwebtoken");

const User = require("../models/user");

const handleError = (error, request, response, next) => {
  console.log(error.message);

  switch (error.name) {
  case "CastError": {
    return response.status(400).json({ error: "Malformed ID" });
  }

  case "ValidationError": {
    return response.status(400).json({ error: error.message });
  }

  case "JsonWebTokenError": {
    return response.status(401).send({ error: "Invalid or missing token" });
  }

  case "TokenExpiredError": {
    return response.status(401).send({ error: "Token expired" });
  }
  }

  next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization") || "";

  request.token = authorization.toLowerCase().startsWith("bearer")
    ? authorization.substring(7)
    : null;

  next();
};

const userExtractor = async (request, response, next) => {
  if (request.method === "GET") {
    return next();
  }

  const { token } = request;
  try {
    const decodedToken = jwt.verify(token, config.SECRET);

    if (!token || !decodedToken.id) {
      return response.status(401).send({ error: "Invalid or missing token" });
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return response.status(401).send({ error: "Invalid token" });
    }

    request.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { handleError, tokenExtractor, userExtractor };
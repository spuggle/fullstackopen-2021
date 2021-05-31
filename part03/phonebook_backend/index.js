require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const PORT = process.env.PORT || 3001;

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).json({ error: "Malformed ID" });
  } else if (error.name === "NotFound") {
    return response.status(404).json({ error: error.message });
  }

  response.status(400).json({ error: error.message });

  next(error);
};

morgan.token("body", request => JSON.stringify(request.body));

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

app.get("/api/persons", (request, response) => {
  Person
    .find({})
    .then(persons => response.json(persons));
});

app.get("/api/persons/:id", (request, response, next) => {
  const requestedID = request.params.id;

  Person
    .findById(requestedID)
    .then(foundPerson => {
      if (foundPerson) {
        response.json(foundPerson);
      } else {
        next({ name: "NotFound", message: `Could not find a person by ID ${requestedID}!` });
      }
    })
    .catch(error => next(error));
});

app.get("/info", (request, response) => {
  Person
    .find({})
    .then(persons => {
      const info = `<div>Phonebook has info for ${persons.length} people</div>${new Date().toString()}`;

      response.send(info);
    });
});

app.post("/api/persons", (request, response, next) => {
  const personData = request.body;

  if (!personData.name) {
    return next(new Error("Name field is empty"));
  } else if (!personData.number) {
    return next(new Error("Number field is empty"));
  }

  const newPerson = new Person({
    name: personData.name,
    number: personData.number
  });

  newPerson
    .save()
    .then(savedPerson => {
      if (savedPerson) {
        response.json(savedPerson);
      } else {
        next({ name: "NotFound", message: "Could not save the person in the database" });
      }
    })
    .catch(error => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const givenID = request.params.id;
  const givenData = request.body;

  const updatedData = {
    number: givenData.number
  };

  Person
    .findByIdAndUpdate(givenID, updatedData, { runValidators: true, context: "query", new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        next({ name: "NotFound", message: `Person by ID ${givenID} does not exist!` });
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  const targetID = request.params.id;

  Person
    .findByIdAndRemove(targetID)
    .then(() => response.status(204).end())
    .catch(error => next(error));
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`App successfully started! Listening to HTTP requests on port ${PORT}`));
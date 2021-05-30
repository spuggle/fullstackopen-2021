const mongoose = require("mongoose");

const [ password, newName, newNumber ] = process.argv.slice(2);

if (!password) {
  errorThenExit("You did not provide the database password!");
} else if (newName ^ newNumber) {
  errorThenExit("You did not provide proper details of the person you want to add a phonebook entry of!");
}

const URI = `mongodb+srv://backend_access:${password}@fullstackopen.szqme.mongodb.net/person-app?retryWrites=true&w=majority`;

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: false
});

const personSchema = mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model("Person", personSchema);

if (newName && newNumber) {
  createNewPerson();
} else {
  getAllPersons();
}

function createNewPerson() {
  Person
    .create({
      name: newName,
      number: newNumber
    })
    .then(response => {
      console.log(`Added ${newName} number ${newNumber} to the phonebook!`);
      mongoose.connection.close();
    });
}

function getAllPersons() {
  Person
    .find({})
    .then(result => {
      console.log("Phonebook");

      for (const { name, number } of result) {
        console.log(`${name} ${number}`);
      }

      mongoose.connection.close();
    });
}

function errorThenExit(errorMessage) {
  console.error(errorMessage);
  process.exit(1);
}
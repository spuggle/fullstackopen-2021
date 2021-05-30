const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const URI = process.env.MONGODB_URI;

mongoose
  .connect(URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: false,
    useFindAndModify: false
  })
  .then(() => console.log("Connected to MongoDB"));

const personSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true
  }
});

personSchema.plugin(uniqueValidator);

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Person", personSchema);
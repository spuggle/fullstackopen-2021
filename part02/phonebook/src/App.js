import React, { useState, useEffect } from "react";
import entryService from "./services/entries";
import PersonForm from "./components/PersonForm";
import People from "./components/People";
import Filter from "./components/Filter";
import Notification from "./components/Notification";

const defaultNotification = { text: "", type: "none" };
const generateNotification = (text, type = "none") => ({ text, type });

const App = () => {
  const [ phoneEntries, setPhoneEntries ] = useState([]);
  const [ newName, setNewName ] = useState("");
  const [ newNumber, setNewNumber ] = useState("");
  const [ filterText, setFilterText ] = useState("");
  const [ notification, setNotification ] = useState(defaultNotification);

  useEffect(() => {
    setTimeout(() => setNotification(defaultNotification), 2000);
  }, [ notification.text ]);

  const filteredRecords = filterText
    ? phoneEntries.filter(phoneEntry => phoneEntry.name
        .toLowerCase()
        .includes(filterText.toLowerCase())
      )
    : phoneEntries;

  useEffect(() => {
    entryService
      .getAll()
      .then(entries => setPhoneEntries([ ...phoneEntries, ...entries ]));
  }, []);

  const addEntryToPhonebook = event => {
    event.preventDefault();

    const existingEntry = phoneEntries.find(person => person.name === newName);
    if (existingEntry) {
      const hasConfirmedReplacement = window.confirm(
        `${newName} is already added to the phonebook. Replace the old number with the provided one?`
      );

      if (hasConfirmedReplacement) {
        entryService
          .update(existingEntry.id, { ...existingEntry, number: newNumber })
          .then(updatedEntry => {
            setPhoneEntries(
              phoneEntries
                .map(phoneEntry => phoneEntry.id === existingEntry.id ? updatedEntry : phoneEntry)
            );

            setNotification(
              generateNotification(`Successfully updated ${newName}'s number`, "success")
            );
          })
          .catch(() => {
            setNotification(
              generateNotification(`Phonebook entry for '${newName}' does not exist in the server!`, "error")
            );

            setPhoneEntries(
              phoneEntries.filter(phoneEntry => phoneEntry.id !== existingEntry.id)
            );
          });
      }
    } else {
      const newEntry = {
        name: newName,
        number: newNumber
      };

      entryService
        .add(newEntry)
        .then(addedEntry => {
          setPhoneEntries(phoneEntries.concat(addedEntry))
          setNotification(
            generateNotification(`Successfully added ${newName}`, "success")
          );
        })
        .catch(() => setNotification(
          generateNotification(`Could not add phonebook entry for '${newName}'`, "error")
        ));
    }

    setNewName("");
    setNewNumber("");
  };

  const removeEntryFromPhonebook = id => {
    entryService
      .remove(id)
      .catch(() => setNotification(
        generateNotification(`Phone entry does not exist!`, "error")
      ))
      .finally(() => setPhoneEntries(phoneEntries.filter(phoneEntry => phoneEntry.id !== id)));
  }

  const handleNameChange = event => setNewName(event.target.value);
  const handleNumberChange = event => setNewNumber(event.target.value);
  const handleFilterChange = event => setFilterText(event.target.value);

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification text={notification.text} type={notification.type} />
      <Filter value={filterText} handleChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        handleClick={addEntryToPhonebook}
        handleNameChange={handleNameChange} handleNumberChange={handleNumberChange}
        newName={newName} newNumber={newNumber}
      />
      <h3>Numbers</h3>
      <People records={filteredRecords} handleRemove={removeEntryFromPhonebook} />
    </div>
  );
};

export default App;

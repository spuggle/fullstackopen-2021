const FormInput = ({ text, value, handleChange }) => (
  <div>
    {text}: <input value={value} onChange={handleChange} />
  </div>
);

const PersonForm = ({ handleClick, handleNameChange, handleNumberChange, newName, newNumber }) => {
  return <form>
    <FormInput text="Name" value={newName} handleChange={handleNameChange} />
    <FormInput text="Phone" value={newNumber} handleChange={handleNumberChange} />
    <div>
      <button type="submit" onClick={handleClick}>Add</button>
    </div>
  </form>
};

export default PersonForm;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DisplayCountries } from "./components/DisplayCountries";

const App = () => {
  const [ filterCountry, setFilterCountry ] = useState("");
  const [ filteredCountryList, setFilteredCountryList ] = useState([]);

  useEffect(() => {
    axios.get(`https://restcountries.eu/rest/v2/name/${filterCountry.toLowerCase()}`)
      .then(response => setFilteredCountryList(response.data))
      .catch(() => setFilteredCountryList([]));
  }, [ filterCountry ]);
  
  const filterChange = event => setFilterCountry(event.target.value);
  const showCountry = country => () => setFilteredCountryList([ country ]);

  return (
    <div>
      Find Countries: <input value={filterCountry} onChange={filterChange} />
      <DisplayCountries countries={filteredCountryList} handleClick={showCountry} />
    </div>
  );
};

export default App;

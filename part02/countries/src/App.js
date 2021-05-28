import React, { useState, useEffect } from "react";
import axios from "axios";

const Text = ({ text }) => <div>{text}</div>;
const CountryItem = ({ country, handleClick }) => (
  <div>
    {country.name} <button onClick={handleClick(country)}>Show</button>
  </div>
);
const CountryDetails = ({ country }) => {
  const [ weatherData, setWeatherData ] = useState();

  useEffect(() => {
    axios.get(`http://api.weatherstack.com/current?access_key=${process.env.REACT_APP_API_KEY}&query=${country.capital}`)
      .then(({ data }) => setWeatherData(data.current))
      .catch(console.error);
  }, []);

  const weatherElement = weatherData
    ? (
      <div>
        <h2>Weather in {country.capital}</h2>
        <div>
          <b>Temperature:</b> {weatherData.temperature} Celcius
        </div>
        <img src={weatherData.weather_icons[0]} alt={weatherData.weather_descriptions[0]} />
        <div>
          <b>Wind:</b> {weatherData.wind_speed} MPH, direction {weatherData.wind_dir}
        </div>
      </div>
    )
    : <></>;

  return (
    <>
      <h1>{country.name}</h1>
      <div>Capital: {country.capital}</div>
      <div>Population: {country.population}</div>

      <h2>Languages</h2>
      <ul>
        {country.languages.map(language => <li key={language.iso639_2} >{language.name}</li>)}
      </ul>

      <img src={country.flag} width="100" alt={`Flag of ${country.name}`} />

      {weatherElement}
    </>
  );
};

const DisplayCountries = ({ countries, handleClick }) => {
  if (countries.length > 10) {
    return <Text text="Too many matches, specify another filter" />
  } else if (!countries.length) {
    return <Text text="Start entering the name of the country you are looking for" />
  } else if (countries.length > 1) {
    return countries.map(country => <CountryItem
      key={country.numericCode} country={country} handleClick={handleClick}
    />);
  } else {
    const [ country ] = countries;

    return <CountryDetails country={country} />;
  }
};

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

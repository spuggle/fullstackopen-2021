import React, { useState, useEffect } from "react";
import axios from "axios";
import DisplayWeather from "./DisplayWeather";

const Text = ({ text }) => <div>{text}</div>;

const CountryItem = ({ country, handleClick }) => (
  <div>
    {country.name} <button onClick={handleClick(country)}>Show</button>
  </div>
);

const CountryDetails = ({ country }) => {
  const [weatherData, setWeatherData] = useState();

  useEffect(() => {
    axios
      .get(
        `http://api.weatherstack.com/current?access_key=${process.env.REACT_APP_API_KEY}&query=${country.capital}`
      )
      .then(({ data }) => setWeatherData(data.current))
      .catch(console.error);
  }, [ country.capital ]);

  return (
    <>
      <h1>{country.name}</h1>
      <div>Capital: {country.capital}</div>
      <div>Population: {country.population}</div>

      <h2>Languages</h2>
      <ul>
        {country.languages.map(language => <li key={language.iso639_2}>{language.name}</li>)}
      </ul>

      <img src={country.flag} width="100" alt={`Flag of ${country.name}`} />

      {weatherData
        ? <DisplayWeather country={country} weatherData={weatherData} />
        : <></>}
    </>
  );
};
export const DisplayCountries = ({ countries, handleClick }) => {
  if (countries.length > 10) {
    return <Text text="Too many matches, specify another filter" />;
  } else if (!countries.length) {
    return <Text text="Start entering the name of the country you are looking for" />;
  } else if (countries.length > 1) {
    return countries.map(country => <CountryItem
      key={country.numericCode} country={country} handleClick={handleClick} />);
  } else {
    const [country] = countries;

    return <CountryDetails country={country} />;
  }
};

import React from "react";

const DisplayWeather = ({ country, weatherData }) => (
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
);

export default DisplayWeather;
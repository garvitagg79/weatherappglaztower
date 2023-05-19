import React, { useState } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import "./weather.css";
import { Line } from "react-chartjs-2";
import { XYPlot, VerticalBarSeries, XAxis, YAxis } from "react-vis";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Weather = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = "e7091ad80837751501737df65b0bf76d"; // Replace with your API key

  const loadSuggestions = async (value) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${API_KEY}`
      );
      const cities = response.data.map((city) => ({
        name: city.name,
        country: city.country,
      }));
      setSuggestions(cities);
    } catch (error) {
      setSuggestions([]);
    }
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    loadSuggestions(value);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setQuery(`${suggestion.name}, ${suggestion.country}`);
  };

  const getSuggestionValue = (suggestion) => {
    return `${suggestion.name}, ${suggestion.country}`;
  };

  const renderSuggestion = (suggestion) => {
    return (
      <div className="suggestion">{`${suggestion.name}, ${suggestion.country}`}</div>
    );
  };

  const renderSuggestionsContainer = ({ containerProps, children }) => {
    return (
      <div {...containerProps} className="suggestions-container">
        {children}
      </div>
    );
  };

  const theme = {
    suggestionHighlighted: "highlighted",
  };

  const handleChange = (event, { newValue }) => {
    setQuery(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch weather data");
      setWeather(null);
      setLoading(false);
    }
  };

  const renderGraphs = () => {
    if (!weather) return null;

    const { main, wind, sys } = weather;

    return (
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {weather.name}, {sys.country}
        </h2>
        <div className="circular-bars-container">
          <div className="circular-bar">
            <CircularProgressbar
              value={main.temp}
              text={`${main.temp} °C`}
              strokeWidth={10}
              styles={{
                path: { stroke: "#ff9f1a" },
                text: { fill: "#ff9f1a", fontSize: 17 },
              }}
            />
            <p className="bar-label">
              <strong>Temperature</strong>
            </p>
          </div>
          <div className="circular-bar">
            <CircularProgressbar
              value={main.humidity}
              text={`${main.humidity}%`}
              strokeWidth={10}
              styles={{
                path: { stroke: "#26c6da" },
                text: { fill: "#26c6da" },
              }}
            />
            <p className="bar-label">
              <strong>Humidity</strong>
            </p>
          </div>
        </div>
        <div className="additional-data-container">
          <div className="additional-data-item">
            <strong>Wind Speed:</strong> {wind.speed} m/s
          </div>
          <div className="additional-data-item">
            <strong>Pressure:</strong> {main.pressure} hPa
          </div>
        </div>
      </div>
    );
  };

  const inputProps = {
    placeholder: "Enter city name or ZIP code",
    value: query,
    onChange: handleChange,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Weather App</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        {/* Autosuggest component */}
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          onSuggestionSelected={onSuggestionSelected}
          inputProps={inputProps}
        />
        {/* Submit button */}
        <button
          type="submit"
          className="fixed-button bg-blue-500 text-white py-2 px-4 rounded-md"
          disabled={!query || loading}
        >
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </form>
      {/* Error message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {/* Weather graphs */}
      {renderGraphs()}
    </div>
  );
};

export default Weather;

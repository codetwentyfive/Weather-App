import {eventHandler, throwError} from './display.js';

function formatDate (date) {
  // yyyy-MM-dd for weather history api
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

async function forecastHistory (city, daysBefore) {
  const weatherHistory = 'https://api.weatherapi.com/v1/history.json?key=162d82459c2f4ebf8e0153904232209';
  const today = new Date();
  today.setDate(today.getDate() - daysBefore);
  const dt = formatDate(today);
  try {
    const response = await fetch(`${weatherHistory}&dt=${dt}&q=${city}`, {"mode": "cors"});
    const weatherHistoryData = await response.json();
    return weatherHistoryData;
  } catch (err) {
    console.log('History Error: ', err);
  }
}

async function forecast (city) {
  const weatherFuture = 'https://api.weatherapi.com/v1/forecast.json?key=162d82459c2f4ebf8e0153904232209';
  try {
    const response = await fetch(`${weatherFuture}&days=3&q=${city}`, {"mode": "cors"});
    const weatherFutureData = await response.json();
    return weatherFutureData;
    } catch (err) {
      throwError('Cannot load data...'); 
  }
}

export {forecast, forecastHistory};

eventHandler();


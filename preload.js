const { contextBridge } = require('electron');
const axios = require('axios');
require('dotenv').config();

contextBridge.exposeInMainWorld('weatherAPI', {
  getLocation: async () => {
    const res = await axios.get('http://ip-api.com/json');
    return res.data;
  },
  getWeather: async (city) => {
    const apiKey = process.env.OPENWEATHER_KEY;
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pt`);
    return res.data;
  }
});

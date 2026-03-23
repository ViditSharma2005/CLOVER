const axios = require('axios');
const WeatherEvent = require('../models/WeatherEvent');
const logger = require('../utils/logger');

const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Disruption thresholds
const THRESHOLDS = {
  extreme_heat: { temp: 42 },      // >42°C
  heavy_rain: { rainfall: 64.5 },  // >64.5mm/hr (IMD heavy rain)
  severe_pollution: { aqi: 301 },  // AQI > 301 (hazardous)
  flood: { rainfall: 115.6, description: 'flood' },
  cyclone: { windSpeed: 63 },      // >63 km/h
  dense_fog: { visibility: 200 },  // <200m visibility
  cold_wave: { temp: 10 }          // <10°C
};

const MOCK_WEATHER_BY_CITY = {
  mumbai: { temp: 35, humidity: 85, rainfall: 80, windSpeed: 25, visibility: 500, aqi: 120, description: 'heavy rain', weatherCode: 502 },
  delhi: { temp: 44, humidity: 30, rainfall: 0, windSpeed: 15, visibility: 2000, aqi: 350, description: 'haze', weatherCode: 721 },
  bangalore: { temp: 28, humidity: 65, rainfall: 10, windSpeed: 12, visibility: 8000, aqi: 85, description: 'light rain', weatherCode: 300 },
  chennai: { temp: 38, humidity: 75, rainfall: 5, windSpeed: 20, visibility: 3000, aqi: 95, description: 'haze', weatherCode: 721 },
  kolkata: { temp: 36, humidity: 80, rainfall: 45, windSpeed: 18, visibility: 1500, aqi: 130, description: 'moderate rain', weatherCode: 501 },
  hyderabad: { temp: 40, humidity: 45, rainfall: 2, windSpeed: 10, visibility: 5000, aqi: 110, description: 'sunny', weatherCode: 800 },
  pune: { temp: 32, humidity: 55, rainfall: 8, windSpeed: 14, visibility: 6000, aqi: 75, description: 'partly cloudy', weatherCode: 801 },
  ahmedabad: { temp: 45, humidity: 20, rainfall: 0, windSpeed: 20, visibility: 3000, aqi: 180, description: 'sunny', weatherCode: 800 },
  default: { temp: 33, humidity: 60, rainfall: 5, windSpeed: 12, visibility: 5000, aqi: 100, description: 'partly cloudy', weatherCode: 801 }
};

const getCityMock = (city) => {
  const key = city.toLowerCase().replace(/\s/g, '');
  for (const [k, v] of Object.entries(MOCK_WEATHER_BY_CITY)) {
    if (key.includes(k)) return { ...v };
  }
  return { ...MOCK_WEATHER_BY_CITY.default };
};

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const deriveAqiFromPm25 = (pm25) => {
  // Approximate US AQI conversion for PM2.5 as a fallback when AQI is unavailable.
  const p = safeNumber(pm25, 0);
  if (p <= 12) return Math.round((50 / 12) * p);
  if (p <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (p - 12.1) + 51);
  if (p <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (p - 35.5) + 101);
  if (p <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (p - 55.5) + 151);
  if (p <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (p - 150.5) + 201);
  if (p <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (p - 250.5) + 301);
  return Math.round(((500 - 401) / (500.4 - 350.5)) * (Math.min(p, 500.4) - 350.5) + 401);
};

const geocodeCity = async (city) => {
  try {
    const res = await axios.get(OPEN_METEO_GEOCODING_URL, {
      params: {
        name: city,
        country: 'IN',
        count: 1,
        language: 'en',
        format: 'json'
      },
      timeout: 6000
    });

    const first = res.data?.results?.[0];
    if (!first) return null;

    return {
      lat: first.latitude,
      lon: first.longitude,
      resolvedCity: first.name
    };
  } catch (err) {
    logger.warn(`Geocoding failed for ${city}: ${err.message}`);
    return null;
  }
};

const fetchWeatherData = async (city, lat, lon) => {
  try {
    let resolvedLat = lat;
    let resolvedLon = lon;
    let resolvedCity = city;

    if (!resolvedLat || !resolvedLon) {
      const geo = await geocodeCity(city);
      if (geo) {
        resolvedLat = geo.lat;
        resolvedLon = geo.lon;
        resolvedCity = geo.resolvedCity || city;
      }
    }

    if (!resolvedLat || !resolvedLon) {
      throw new Error('Unable to resolve city coordinates');
    }

    const res = await axios.get(OPEN_METEO_WEATHER_URL, {
      params: {
        latitude: resolvedLat,
        longitude: resolvedLon,
        current: [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'precipitation',
          'wind_speed_10m',
          'visibility',
          'weather_code'
        ].join(','),
        timezone: 'auto'
      },
      timeout: 7000
    });

    const c = res.data?.current || {};

    return {
      temp: safeNumber(c.temperature_2m),
      feelsLike: safeNumber(c.apparent_temperature),
      humidity: safeNumber(c.relative_humidity_2m),
      rainfall: safeNumber(c.precipitation),
      windSpeed: safeNumber(c.wind_speed_10m),
      visibility: safeNumber(c.visibility, 5000),
      description: `code_${safeNumber(c.weather_code)}`,
      weatherCode: safeNumber(c.weather_code),
      lat: resolvedLat,
      lon: resolvedLon,
      city: resolvedCity,
      source: 'open-meteo'
    };
  } catch (err) {
    logger.warn(`Weather API failed for ${city}: ${err.message}. Using mock.`);
    return { ...getCityMock(city), source: 'mock' };
  }
};

const fetchAQIData = async (city, lat, lon) => {
  try {
    let resolvedLat = lat;
    let resolvedLon = lon;

    if (!resolvedLat || !resolvedLon) {
      const geo = await geocodeCity(city);
      resolvedLat = geo?.lat;
      resolvedLon = geo?.lon;
    }

    if (!resolvedLat || !resolvedLon) {
      throw new Error('Unable to resolve city coordinates for AQI');
    }

    const res = await axios.get(OPEN_METEO_AIR_QUALITY_URL, {
      params: {
        latitude: resolvedLat,
        longitude: resolvedLon,
        current: 'us_aqi,pm2_5',
        timezone: 'auto'
      },
      timeout: 7000
    });

    const current = res.data?.current || {};
    const aqi = safeNumber(current.us_aqi, 0);
    if (aqi > 0) return aqi;

    return deriveAqiFromPm25(current.pm2_5);
  } catch (err) {
    logger.warn(`AQI API failed for ${city}: ${err.message}. Using mock.`);
    return getCityMock(city).aqi;
  }
};

const evaluateTriggers = (weatherData) => {
  const triggers = [];

  if (weatherData.temp >= THRESHOLDS.extreme_heat.temp) {
    triggers.push({ type: 'extreme_heat', severity: weatherData.temp >= 47 ? 'extreme' : weatherData.temp >= 44 ? 'high' : 'moderate' });
  }
  if (weatherData.rainfall >= THRESHOLDS.heavy_rain.rainfall) {
    triggers.push({ type: 'heavy_rain', severity: weatherData.rainfall >= 204 ? 'extreme' : weatherData.rainfall >= 115 ? 'high' : 'moderate' });
  }
  if (weatherData.aqi >= THRESHOLDS.severe_pollution.aqi) {
    triggers.push({ type: 'severe_pollution', severity: weatherData.aqi >= 400 ? 'extreme' : weatherData.aqi >= 350 ? 'high' : 'moderate' });
  }
  if (weatherData.windSpeed >= THRESHOLDS.cyclone.windSpeed) {
    triggers.push({ type: 'cyclone', severity: 'high' });
  }
  if (weatherData.visibility < THRESHOLDS.dense_fog.visibility) {
    triggers.push({ type: 'dense_fog', severity: 'moderate' });
  }
  if (weatherData.temp <= THRESHOLDS.cold_wave.temp) {
    triggers.push({ type: 'cold_wave', severity: 'moderate' });
  }

  return triggers;
};

const getWeatherForCities = async (cities) => {
  const results = [];
  for (const city of cities) {
    const data = await fetchWeatherData(city.name, city.lat, city.lon);
    const aqi = await fetchAQIData(city.name, city.lat, city.lon);
    data.aqi = aqi;
    const triggers = evaluateTriggers(data);

    // Save to DB
    for (const trigger of triggers) {
      const existingEvent = await WeatherEvent.findOne({
        city: city.name,
        eventType: trigger.type,
        isActive: true,
        startTime: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
      });

      if (!existingEvent) {
        await WeatherEvent.create({
          city: city.name,
          eventType: trigger.type,
          severity: trigger.severity,
          data: { temperature: data.temp, rainfall: data.rainfall, windSpeed: data.windSpeed, visibility: data.visibility, aqiIndex: aqi, description: data.description },
          startTime: new Date(),
          isActive: true,
          isTriggerMet: true,
          source: data.source
        });
        logger.info(`New weather event: ${trigger.type} in ${city.name}`);
      }
    }

    results.push({ city: city.name, weather: data, triggers });
  }
  return results;
};

module.exports = { fetchWeatherData, fetchAQIData, evaluateTriggers, getWeatherForCities, THRESHOLDS };

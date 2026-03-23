const mongoose = require('mongoose');

const weatherEventSchema = new mongoose.Schema({
  city: { type: String, required: true },
  eventType: {
    type: String,
    enum: ['extreme_heat', 'heavy_rain', 'flood', 'severe_pollution', 'cyclone', 'hailstorm', 'dense_fog', 'cold_wave', 'curfew', 'strike', 'platform_outage'],
    required: true
  },
  severity: { type: String, enum: ['low', 'moderate', 'high', 'extreme'], required: true },
  
  // Trigger threshold data
  data: {
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    rainfall: Number,
    windSpeed: Number,
    visibility: Number,
    aqiIndex: Number,
    weatherCode: Number,
    description: String
  },

  // Geolocation
  latitude: Number,
  longitude: Number,
  affectedZones: [String],

  // Duration
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  isActive: { type: Boolean, default: true },

  // Trigger info
  triggerThreshold: mongoose.Schema.Types.Mixed,
  isTriggerMet: { type: Boolean, default: false },
  affectedWorkerCount: { type: Number, default: 0 },
  claimsTriggered: { type: Number, default: 0 },

  // Source
  source: { type: String, enum: ['openweathermap', 'open-meteo', 'imd', 'mock', 'manual'], default: 'open-meteo' },
  rawApiResponse: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

weatherEventSchema.index({ city: 1, isActive: 1 });
weatherEventSchema.index({ startTime: -1 });
weatherEventSchema.index({ isTriggerMet: 1, isActive: 1 });

module.exports = mongoose.model('WeatherEvent', weatherEventSchema);

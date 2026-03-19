import api from '../client';

export const f1API = {
  // Seasons & Calendar
  getSeasons: () => api.get('/f1/seasons'),
  getRaces: (year: number) => api.get(`/f1/races?year=${year}`),
  getRaceInfo: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/race-info?year=${year}&race=${race}&session_type=${sessionType}`),

  // Drivers
  getDrivers: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/drivers?year=${year}&race=${race}&session_type=${sessionType}`),

  // Standings / Results
  getStandings: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/standings?year=${year}&race=${race}&session_type=${sessionType}`),

  // Lap Times
  getLapTimes: (year: number, race: string, driver = '', sessionType = 'Race', lapStart = 1, lapEnd = 999) =>
    api.get(`/f1/lap-times?year=${year}&race=${race}&driver=${driver}&session_type=${sessionType}&lap_start=${lapStart}&lap_end=${lapEnd}`),

  // Telemetry
  getTelemetry: (driver: string, year: number, race: string, lap = 0, sessionType = 'Race') =>
    api.get(`/f1/telemetry?driver=${driver}&year=${year}&race=${race}&lap=${lap}&session_type=${sessionType}`),

  // Tyre Strategy
  getStrategy: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/strategy?year=${year}&race=${race}&session_type=${sessionType}`),

  // Pit Stops
  getPitStops: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/pit-stops?year=${year}&race=${race}&session_type=${sessionType}`),

  // Race Control
  getRaceControl: (year: number, race: string, sessionType = 'Race', category = '') =>
    api.get(`/f1/race-control?year=${year}&race=${race}&session_type=${sessionType}&category=${category}`),

  // Weather
  getWeather: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/weather?year=${year}&race=${race}&session_type=${sessionType}`),
  getWeatherSeries: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/weather-series?year=${year}&race=${race}&session_type=${sessionType}`),

  // Speed Traps
  getSpeedTraps: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/speed-traps?year=${year}&race=${race}&session_type=${sessionType}`),

  // Driver Comparison
  getDriverComparison: (driverA: string, driverB: string, year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/driver-comparison?driver_a=${driverA}&driver_b=${driverB}&year=${year}&race=${race}&session_type=${sessionType}`),

  // Lap Positions (Position River)
  getLapPositions: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/lap-positions?year=${year}&race=${race}&session_type=${sessionType}`),

  // Overtakes
  getOvertakes: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/overtakes?year=${year}&race=${race}&session_type=${sessionType}`),

  // Championship Prediction
  getChampionshipPrediction: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/championship-prediction?year=${year}&race=${race}&session_type=${sessionType}`),

  // Timing Stats
  getTimingStats: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/timing-stats?year=${year}&race=${race}&session_type=${sessionType}`),

  // Track Status
  getTrackStatus: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/track-status?year=${year}&race=${race}&session_type=${sessionType}`),

  // Race Replay
  getReplayData: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/replay?year=${year}&race=${race}&session_type=${sessionType}`),

  // Grid vs Finish
  getGridVsFinish: (year: number, race: string, sessionType = 'Race') =>
    api.get(`/f1/grid-vs-finish?year=${year}&race=${race}&session_type=${sessionType}`),

  // Historical
  getHistoricalResults: (year = 0, race = '', driver = '') =>
    api.get(`/f1/historical/results?year=${year}&race=${race}&driver=${driver}`),
  getHistoricalStandings: (year = 0, standingsType = 'driver') =>
    api.get(`/f1/historical/standings?year=${year}&standings_type=${standingsType}`),
};

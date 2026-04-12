import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://ideal-yodel-pjqrj796rxvx35rp-8000.app.github.dev',
})

export const fetchCities = () => api.get('/api/cities/').then(r => r.data)
export const fetchSummary = (cityId?: number) => api.get('/api/analytics/summary', { params: { city_id: cityId } }).then(r => r.data)
export const fetchOntimePerformance = (cityId?: number) => api.get('/api/analytics/ontime-performance', { params: { city_id: cityId } }).then(r => r.data)
export const fetchCongestionByHour = (cityId?: number) => api.get('/api/analytics/congestion-by-hour', { params: { city_id: cityId } }).then(r => r.data)
export const fetchDelayByCause = (cityId?: number) => api.get('/api/analytics/delay-by-cause', { params: { city_id: cityId } }).then(r => r.data)
export const fetchRidershipTrend = (cityId?: number) => api.get('/api/analytics/ridership-trend', { params: { city_id: cityId } }).then(r => r.data)
export const fetchStations = (cityId?: number) => api.get('/api/stations/', { params: { city_id: cityId } }).then(r => r.data)
export const fetchLines = (cityId?: number) => api.get('/api/cities/' + (cityId || '') + (cityId ? '/lines' : '../routes/'), ).then(r => r.data)
export const fetchCityLines = (cityId: number) => api.get(`/api/cities/${cityId}/lines`).then(r => r.data)
export const fetchAllLines = () => api.get('/api/routes/').then(r => r.data)
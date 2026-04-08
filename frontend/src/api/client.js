import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ── Öffentliche Endpunkte ──────────────────────────────────────────────────

export const fetchSchedule = (date) =>
  api.get('/schedule/', { params: { date } }).then((r) => r.data)

export const fetchWeekOverview = (start) =>
  api.get('/week/', { params: { start } }).then((r) => r.data)

export const createBooking = (data) =>
  api.post('/bookings/', data).then((r) => r.data)

export const fetchBookingByToken = (token) =>
  api.get(`/bookings/${token}/detail/`).then((r) => r.data)

export const cancelBookingByToken = (token) =>
  api.post(`/bookings/${token}/cancel/`).then((r) => r.data)

// ── Admin-Endpunkte (Session-Cookie via OIDC) ──────────────────────────────

export const fetchAdminBookings = (date) =>
  api.get('/admin/bookings/', { params: { date } }).then((r) => r.data)

export const updateBookingStatus = (id, status) =>
  api.patch(`/admin/bookings/${id}/`, { status }).then((r) => r.data)

export const fetchAdminBlocks = (start, end) =>
  api.get('/admin/blocks/', { params: { start, end } }).then((r) => r.data)

export const createBlock = (data) =>
  api.post('/admin/blocks/', data).then((r) => r.data)

export const deleteBlock = (id) =>
  api.delete(`/admin/blocks/${id}/`)

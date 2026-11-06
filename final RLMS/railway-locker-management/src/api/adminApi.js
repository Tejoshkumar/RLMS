import { authGet } from './httpClient.js'

export async function getAdminUsers() {
  const response = await authGet('/api/admin/users')
  return response.data.users
}

export async function getAdminBookings() {
  const response = await authGet('/api/admin/bookings')
  return response.data.bookings
}

import { authPut } from './httpClient.js'

export async function updateUserProfile(profile) {
  const response = await authPut('/api/users/profile', profile)
  return response.data
}

export async function updateUserPassword(passwords) {
  return authPut('/api/users/change-password', passwords)
}

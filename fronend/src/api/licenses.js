import client from './client'

export const listLicenses = (status) =>
  client.get('/licenses', { params: status ? { status } : {} }).then((r) => r.data)

export const createLicense = (payload) =>
  client.post('/licenses', payload).then((r) => r.data)

export const getLicense = (id) =>
  client.get(`/licenses/${id}`).then((r) => r.data)

export const updateLicenseStatus = (id, status) =>
  client.patch(`/licenses/${id}/status`, { status }).then((r) => r.data)

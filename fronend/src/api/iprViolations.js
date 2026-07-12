import client from './client'

export const reportViolation = (payload) =>
  client.post('/ipr-violations', payload).then((r) => r.data)

export const listViolations = () => client.get('/ipr-violations').then((r) => r.data)

export const updateViolationStatus = (id, status) =>
  client.patch(`/ipr-violations/${id}/status`, { status }).then((r) => r.data)

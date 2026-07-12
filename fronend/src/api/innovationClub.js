import client from './client'

export const applyToClub = (payload) =>
  client.post('/innovation-club/apply', payload).then((r) => r.data)

export const listApplications = () =>
  client.get('/innovation-club/applications').then((r) => r.data)

export const updateApplicationStatus = (id, status) =>
  client.patch(`/innovation-club/applications/${id}/status`, { status }).then((r) => r.data)

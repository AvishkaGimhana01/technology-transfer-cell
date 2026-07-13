import client from './client'

export const listDeadlines = (status) =>
  client.get('/deadlines', { params: status ? { status } : {} }).then((r) => r.data)

export const createDeadline = (payload) =>
  client.post('/deadlines', payload).then((r) => r.data)

export const updateDeadlineStatus = (id, status) =>
  client.patch(`/deadlines/${id}/status`, { status }).then((r) => r.data)

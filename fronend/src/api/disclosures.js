import client from './client'

export const listDisclosures = (status) =>
  client.get('/disclosures', { params: status ? { status } : {} }).then((r) => r.data)

export const createDisclosure = (payload) =>
  client.post('/disclosures', payload).then((r) => r.data)

export const getDisclosure = (id) =>
  client.get(`/disclosures/${id}`).then((r) => r.data)

export const updateDisclosureStatus = (id, status) =>
  client.patch(`/disclosures/${id}/status`, { status }).then((r) => r.data)

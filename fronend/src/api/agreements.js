import client from './client'

export const listAgreements = () => client.get('/agreements').then((r) => r.data)
export const createAgreement = (payload) => client.post('/agreements', payload).then((r) => r.data)
export const updateAgreement = (id, payload) => client.patch(`/agreements/${id}`, payload).then((r) => r.data)
export const deleteAgreement = (id) => client.delete(`/agreements/${id}`).then((r) => r.data)

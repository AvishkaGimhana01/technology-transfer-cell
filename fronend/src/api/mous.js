import client from './client'

export const listMous = () => client.get('/mous').then((r) => r.data)
export const createMou = (payload) => client.post('/mous', payload).then((r) => r.data)
export const updateMou = (id, payload) => client.patch(`/mous/${id}`, payload).then((r) => r.data)
export const deleteMou = (id) => client.delete(`/mous/${id}`).then((r) => r.data)

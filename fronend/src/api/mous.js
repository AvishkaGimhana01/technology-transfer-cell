import client from './client'

export const listMous = () => client.get('/mous').then((r) => r.data)
export const createMou = (payload) => client.post('/mous', payload).then((r) => r.data)

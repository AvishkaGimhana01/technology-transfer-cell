import client from './client'

export const listAgreements = () => client.get('/agreements').then((r) => r.data)
export const createAgreement = (payload) => client.post('/agreements', payload).then((r) => r.data)

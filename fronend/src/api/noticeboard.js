import client from './client'

export const listPosts = () => client.get('/noticeboard').then((r) => r.data)
export const createPost = (payload) => client.post('/noticeboard', payload).then((r) => r.data)

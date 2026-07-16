import client from './client'

export const listPosts = () => client.get('/noticeboard').then((r) => r.data)
export const createPost = (payload) => client.post('/noticeboard', payload).then((r) => r.data)
export const updatePost = (id, payload) => client.patch(`/noticeboard/${id}`, payload).then((r) => r.data)
export const deletePost = (id) => client.delete(`/noticeboard/${id}`).then((r) => r.data)

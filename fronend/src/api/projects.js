import client from './client'

export const listProjects = (status) =>
  client.get('/projects', { params: status ? { status } : {} }).then((r) => r.data)

export const getProject = (id) => client.get(`/projects/${id}`).then((r) => r.data)

export const createProject = (payload) => client.post('/projects', payload).then((r) => r.data)

export const updateProjectStatus = (id, status) =>
  client.patch(`/projects/${id}/status`, { status }).then((r) => r.data)

export const updateProject = (id, payload) => client.patch(`/projects/${id}`, payload).then((r) => r.data)
export const deleteProject = (id) => client.delete(`/projects/${id}`).then((r) => r.data)

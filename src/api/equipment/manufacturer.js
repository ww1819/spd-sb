import request from '@/utils/request'

export function listManufacturer(query) {
  return request({ url: '/equipment/manufacturer/list', method: 'get', params: query })
}
export function getManufacturer(id) {
  return request({ url: '/equipment/manufacturer/' + id, method: 'get' })
}
export function getOrCreateManufacturer(name) {
  return request({ url: '/equipment/manufacturer/getOrCreate', method: 'post', params: { name } })
}
export function addManufacturer(data) {
  return request({ url: '/equipment/manufacturer', method: 'post', data })
}
export function updateManufacturer(data) {
  return request({ url: '/equipment/manufacturer', method: 'put', data })
}
export function delManufacturer(id) {
  return request({ url: '/equipment/manufacturer/' + id, method: 'delete' })
}

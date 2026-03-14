import request from '@/utils/request'

export function listBrand(query) {
  return request({ url: '/equipment/brand/list', method: 'get', params: query })
}
export function getBrand(id) {
  return request({ url: '/equipment/brand/' + id, method: 'get' })
}
export function addBrand(data) {
  return request({ url: '/equipment/brand', method: 'post', data })
}
export function updateBrand(data) {
  return request({ url: '/equipment/brand', method: 'put', data })
}
export function delBrand(id) {
  return request({ url: '/equipment/brand/' + id, method: 'delete' })
}

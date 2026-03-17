import request from '@/utils/request'

export function listSupplier(query) {
  return request({ url: '/equipment/supplier/list', method: 'get', params: query })
}
export function getSupplier(id) {
  return request({ url: '/equipment/supplier/' + id, method: 'get' })
}
export function getOrCreateSupplier(name) {
  return request({ url: '/equipment/supplier/getOrCreate', method: 'post', params: { name } })
}
export function addSupplier(data) {
  return request({ url: '/equipment/supplier', method: 'post', data })
}
export function updateSupplier(data) {
  return request({ url: '/equipment/supplier', method: 'put', data })
}
export function delSupplier(id) {
  return request({ url: '/equipment/supplier/' + id, method: 'delete' })
}

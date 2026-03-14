import request from '@/utils/request'

export function listAssetCategory(query) {
  return request({ url: '/equipment/assetCategory/list', method: 'get', params: query })
}
export function getAssetCategory(id) {
  return request({ url: '/equipment/assetCategory/' + id, method: 'get' })
}
export function addAssetCategory(data) {
  return request({ url: '/equipment/assetCategory', method: 'post', data })
}
export function updateAssetCategory(data) {
  return request({ url: '/equipment/assetCategory', method: 'put', data })
}
export function delAssetCategory(id) {
  return request({ url: '/equipment/assetCategory/' + id, method: 'delete' })
}

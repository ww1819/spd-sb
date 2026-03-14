import request from '@/utils/request'

export function listAssetLedger(query) {
  return request({ url: '/equipment/assetLedger/list', method: 'get', params: query })
}
export function getAssetLedger(id) {
  return request({ url: '/equipment/assetLedger/' + id, method: 'get' })
}
export function addAssetLedger(data) {
  return request({ url: '/equipment/assetLedger', method: 'post', data })
}
export function updateAssetLedger(data) {
  return request({ url: '/equipment/assetLedger', method: 'put', data })
}
export function delAssetLedger(id) {
  return request({ url: '/equipment/assetLedger/' + id, method: 'delete' })
}
export function exportAssetLedger(query) {
  return request({ url: '/equipment/assetLedger/export', method: 'post', params: query })
}

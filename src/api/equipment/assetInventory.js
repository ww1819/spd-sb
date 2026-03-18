import request from '@/utils/request'

export function listAssetInventory(query) {
  return request({ url: '/equipment/assetInventory/list', method: 'get', params: query })
}

export function getAssetInventory(id) {
  return request({ url: '/equipment/assetInventory/' + id, method: 'get' })
}

export function addAssetInventory(data) {
  return request({ url: '/equipment/assetInventory', method: 'post', data })
}

export function updateAssetInventory(data) {
  return request({ url: '/equipment/assetInventory', method: 'put', data })
}

export function delAssetInventory(id) {
  return request({ url: '/equipment/assetInventory/' + id, method: 'delete' })
}

export function exportAssetInventory(query) {
  return request({ url: '/equipment/assetInventory/export', method: 'post', params: query, responseType: 'blob' })
}

export function submitAssetInventory(id) {
  return request({ url: '/equipment/assetInventory/' + id + '/submit', method: 'put' })
}

export function auditAssetInventory(id) {
  return request({ url: '/equipment/assetInventory/' + id + '/audit', method: 'put' })
}

export function printFromInventoryItems(data) {
  return request({ url: '/equipment/assetInventory/printFromItems', method: 'post', data })
}

// 根据盘点类型与表头范围从台账生成盘点明细（仅草稿）
export function buildInventoryItems(id) {
  return request({ url: '/equipment/assetInventory/' + id + '/buildItems', method: 'post' })
}

// 获取当前客户台账中不重复的存放地点列表
export function listStoragePlaces() {
  return request({ url: '/equipment/assetInventory/storagePlaces', method: 'get' })
}

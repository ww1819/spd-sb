import request from '@/utils/request'

export function listAccessory(query) {
  return request({ url: '/equipment/accessory/list', method: 'get', params: query })
}

export function getAccessory(id) {
  return request({ url: '/equipment/accessory/' + id, method: 'get' })
}

export function addAccessory(data) {
  return request({ url: '/equipment/accessory', method: 'post', data })
}

export function updateAccessory(data) {
  return request({ url: '/equipment/accessory', method: 'put', data })
}

export function delAccessory(id) {
  return request({ url: '/equipment/accessory/' + id, method: 'delete' })
}

export function listAccessoryStock(query) {
  return request({ url: '/equipment/accessory/stock/list', method: 'get', params: query })
}

export function listAccessoryIo(query) {
  return request({ url: '/equipment/accessory/io/list', method: 'get', params: query })
}

export function getAccessoryIo(id) {
  return request({ url: '/equipment/accessory/io/detail/' + id, method: 'get' })
}

export function submitAccessoryIo(data) {
  return request({ url: '/equipment/accessory/io', method: 'post', data })
}

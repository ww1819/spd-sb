import request from '@/utils/request'

export function listMeasuringCategory(query) {
  return request({ url: '/equipment/measuringCategory/list', method: 'get', params: query })
}
export function getMeasuringCategory(id) {
  return request({ url: '/equipment/measuringCategory/' + id, method: 'get' })
}
export function addMeasuringCategory(data) {
  return request({ url: '/equipment/measuringCategory', method: 'post', data })
}
export function updateMeasuringCategory(data) {
  return request({ url: '/equipment/measuringCategory', method: 'put', data })
}
export function delMeasuringCategory(id) {
  return request({ url: '/equipment/measuringCategory/' + id, method: 'delete' })
}

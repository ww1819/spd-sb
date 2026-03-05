import request from '@/utils/request'

// 客户列表
export function listCustomer(query) {
  return request({
    url: '/equipment/system/customer/list',
    method: 'get',
    params: query
  })
}

// 客户详情
export function getCustomer(customerId) {
  return request({
    url: '/equipment/system/customer/' + customerId,
    method: 'get'
  })
}

// 新增客户
export function addCustomer(data) {
  return request({
    url: '/equipment/system/customer',
    method: 'post',
    data: data
  })
}

// 修改客户
export function updateCustomer(data) {
  return request({
    url: '/equipment/system/customer',
    method: 'put',
    data: data
  })
}

// 删除客户
export function delCustomer(customerId) {
  return request({
    url: '/equipment/system/customer/' + customerId,
    method: 'delete'
  })
}

// 客户启停用（必填原因）
export function changeCustomerStatus(data) {
  return request({
    url: '/equipment/system/customer/changeStatus',
    method: 'put',
    data: data
  })
}

// 客户已分配菜单ID
export function getCustomerMenuIds(customerId) {
  return request({
    url: '/equipment/system/customer/menuIds/' + customerId,
    method: 'get'
  })
}

// 保存客户菜单权限（使用 data 传参，避免 menuIds 数组被序列成单字符串导致 500）
export function saveCustomerMenus(customerId, menuIds) {
  return request({
    url: '/equipment/system/customer/menu',
    method: 'put',
    params: { customerId },
    data: { menuIds: Array.isArray(menuIds) ? menuIds : [] }
  })
}

// 客户启停用记录
export function getCustomerStatusLogs(customerId) {
  return request({
    url: '/equipment/system/customer/statusLog/' + customerId,
    method: 'get'
  })
}

// 客户使用/停用时间段记录
export function getCustomerPeriodLogs(customerId) {
  return request({
    url: '/equipment/system/customer/periodLog/' + customerId,
    method: 'get'
  })
}

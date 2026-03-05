import request from '@/utils/request'

// 客户已分配菜单列表（含功能状态，仅 M/C）
export function listMenusByCustomerId(customerId) {
  return request({
    url: '/equipment/system/customerMenuManage/list',
    method: 'get',
    params: { customerId }
  })
}

// 客户菜单功能启停用（必填原因）
export function changeMenuStatus(data) {
  return request({
    url: '/equipment/system/customerMenuManage/changeStatus',
    method: 'put',
    data: data
  })
}

// 客户菜单功能启停用记录
export function getMenuStatusLogs(customerId, menuId) {
  return request({
    url: '/equipment/system/customerMenuManage/statusLog',
    method: 'get',
    params: { customerId, menuId }
  })
}

// 客户菜单功能启停用时间段
export function getMenuPeriodLogs(customerId, menuId) {
  return request({
    url: '/equipment/system/customerMenuManage/periodLog',
    method: 'get',
    params: { customerId, menuId }
  })
}

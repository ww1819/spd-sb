import request from '@/utils/request'

// 耗材侧：客户已分配菜单列表（含功能状态）
export function listMenusByCustomerId(tenantId) {
  return request({
    url: '/material/system/customerMenuManage/list',
    method: 'get',
    params: { tenantId }
  })
}

// 耗材侧：客户菜单功能启停用
export function changeMenuStatus(data) {
  return request({
    url: '/material/system/customerMenuManage/changeStatus',
    method: 'put',
    data: data
  })
}

// 耗材侧：客户菜单功能启停用记录
export function getMenuStatusLogs(tenantId, menuId) {
  return request({
    url: '/material/system/customerMenuManage/statusLog',
    method: 'get',
    params: { tenantId, menuId }
  })
}

// 耗材侧：客户菜单功能启停用时间段
export function getMenuPeriodLogs(tenantId, menuId) {
  return request({
    url: '/material/system/customerMenuManage/periodLog',
    method: 'get',
    params: { tenantId, menuId }
  })
}

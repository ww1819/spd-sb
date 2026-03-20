import request from '@/utils/request'

// 代码内租户列表（TenantEnum），新增客户时从此列表选择以关联租户表与枚举
export function getTenantEnumList() {
  return request({
    url: '/equipment/system/customer/tenantEnumList',
    method: 'get'
  })
}

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

// 设备功能重置（将默认对客户开放的权限开放给客户、super 组、super_01）
export function resetEquipmentFunctions(customerId) {
  return request({
    url: '/equipment/system/customer/resetEquipment/' + customerId,
    method: 'put'
  })
}

// 耗材功能重置（耗材客户菜单、super 岗位、super_01 权限重置为系统设置下非平台管理功能）
export function resetMaterialFunctions(customerId) {
  return request({
    url: '/equipment/system/customer/resetMaterial/' + customerId,
    method: 'put'
  })
}

/** 平台级全库初始化（耗材侧 Controller，body.confirmToken 须与后端一致） */
export function initFullDatabase(confirmToken) {
  return request({
    url: '/material/system/customer/initFullDatabase',
    method: 'post',
    data: { confirmToken }
  })
}

/** 按客户物理删除设备侧数据 */
export function purgeEquipmentData(customerId) {
  return request({
    url: '/equipment/system/customer/' + customerId + '/purgeEquipmentData',
    method: 'post',
    data: { confirm: 'PURGE_EQ' }
  })
}

/** 设备客户列表行内：清理该租户耗材数据（走设备 Controller，与后端一致） */
export function purgeConsumablesData(customerId) {
  return request({
    url: '/equipment/system/customer/' + customerId + '/purgeConsumablesData',
    method: 'post',
    data: { confirm: 'PURGE_HC' }
  })
}

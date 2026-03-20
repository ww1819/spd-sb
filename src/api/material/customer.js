import request from '@/utils/request'

// 耗材侧：客户启停用记录（hc_customer_status_log）
export function getCustomerStatusLogs(tenantId) {
  return request({
    url: '/material/system/customer/statusLog',
    method: 'get',
    params: { tenantId }
  })
}

// 耗材侧：客户使用/停用时间段（hc_customer_period_log）
export function getCustomerPeriodLogs(tenantId) {
  return request({
    url: '/material/system/customer/periodLog',
    method: 'get',
    params: { tenantId }
  })
}

/** 平台级全库初始化（与 spd-ui 共用后端） */
export function initFullDatabase(confirmToken) {
  return request({
    url: '/material/system/customer/initFullDatabase',
    method: 'post',
    data: { confirmToken }
  })
}

/** 按租户清理耗材数据（material 路径） */
export function purgeConsumablesData(customerId) {
  return request({
    url: '/material/system/customer/' + customerId + '/purgeConsumablesData',
    method: 'post',
    data: { confirm: 'PURGE_HC' }
  })
}

import request from '@/utils/request'

/** 仓库提醒：待审核申领单、待审核申购单单据数（聚合，仅需登录） */
export function fetchHomeWarehouseReminderCounts() {
  return request({
    url: '/dashboard/home/warehouseReminderCounts',
    method: 'get',
    timeout: 30000,
    headers: { hideError: true }
  })
}

import request from '@/utils/request'

const BASE = '/equipment/system/workgroup'

/** 设备系统工作组列表（按客户） */
export function listWorkGroup(customerId) {
  return request({
    url: BASE + '/list',
    method: 'get',
    params: { customerId }
  })
}

/** 设备系统工作组详情 */
export function getWorkGroup(groupId) {
  return request({
    url: BASE + '/' + groupId,
    method: 'get'
  })
}

/** 新增设备系统工作组 */
export function addWorkGroup(data) {
  return request({
    url: BASE,
    method: 'post',
    data
  })
}

/** 修改设备系统工作组 */
export function updateWorkGroup(data) {
  return request({
    url: BASE,
    method: 'put',
    data
  })
}

/** 删除设备系统工作组 */
export function delWorkGroup(groupId) {
  return request({
    url: BASE + '/' + groupId,
    method: 'delete'
  })
}

/** 工作组下的用户ID列表 */
export function listUserIdsByGroupId(groupId) {
  return request({
    url: BASE + '/users/' + groupId,
    method: 'get'
  })
}

/** 工作组添加用户 */
export function addWorkGroupUsers(groupId, userIds) {
  return request({
    url: BASE + '/users/' + groupId,
    method: 'post',
    data: userIds || []
  })
}

/** 工作组移除用户 */
export function removeWorkGroupUser(groupId, userId) {
  return request({
    url: BASE + '/users/' + groupId + '/' + userId,
    method: 'delete'
  })
}

/** 工作组可分配菜单树（客户已开启） */
export function getWorkGroupMenuTree(customerId) {
  return request({
    url: BASE + '/menuTree',
    method: 'get',
    params: { customerId }
  })
}

/** 工作组的菜单ID列表 */
export function getWorkGroupMenuIds(groupId) {
  return request({
    url: BASE + '/menuIds/' + groupId,
    method: 'get'
  })
}

/** 保存工作组菜单权限（使用逗号分隔字符串避免 PUT 数组参数绑定失败） */
export function saveWorkGroupMenus(groupId, customerId, menuIds) {
  const menuIdsStr = Array.isArray(menuIds) && menuIds.length ? menuIds.map(String).filter(Boolean).join(',') : ''
  return request({
    url: BASE + '/menu/' + groupId,
    method: 'put',
    params: { customerId, menuIdsStr }
  })
}

/** 工作组的仓库ID列表 */
export function getWorkGroupWarehouseIds(groupId) {
  return request({
    url: BASE + '/warehouseIds/' + groupId,
    method: 'get'
  })
}

/** 保存工作组仓库权限（使用逗号分隔字符串避免 PUT 数组参数绑定失败） */
export function saveWorkGroupWarehouses(groupId, customerId, warehouseIds) {
  const arr = warehouseIds || []
  const warehouseIdsStr = Array.isArray(arr) && arr.length ? arr.map(Number).filter(n => !isNaN(n)).join(',') : ''
  return request({
    url: BASE + '/warehouse/' + groupId,
    method: 'put',
    params: { customerId, warehouseIdsStr }
  })
}

/** 工作组的科室ID列表 */
export function getWorkGroupDeptIds(groupId) {
  return request({
    url: BASE + '/deptIds/' + groupId,
    method: 'get'
  })
}

/** 保存工作组科室权限（使用逗号分隔字符串避免 PUT 数组参数绑定失败） */
export function saveWorkGroupDepts(groupId, customerId, deptIds) {
  const arr = deptIds || []
  const deptIdsStr = Array.isArray(arr) && arr.length ? arr.map(Number).filter(n => !isNaN(n)).join(',') : ''
  return request({
    url: BASE + '/dept/' + groupId,
    method: 'put',
    params: { customerId, deptIdsStr }
  })
}

/** 工作组权限同步到组内用户 */
export function syncWorkGroupToUsers(groupId) {
  return request({
    url: BASE + '/sync/' + groupId,
    method: 'post'
  })
}

/** 查询工作组同步状态 */
export function getWorkGroupSyncStatus(groupId) {
  return request({
    url: BASE + '/sync/status/' + groupId,
    method: 'get'
  })
}

// ---------- 兼容旧路径（岗位页/用户页可统一用上面接口） ----------
/** 查询工作组下拉（设备系统下用 listWorkGroup(customerId) 映射） */
export function workgroupTreeSelect() {
  return request({
    url: '/system/post/treeselect',
    method: 'get'
  })
}

import request from '@/utils/request'

// 查询当前客户的68分类列表
export function listCustomerCategory68(query) {
  return request({
    url: '/foundation/customerCategory68/list',
    method: 'get',
    params: query
  })
}

// 查询当前客户的68分类树
export function treeselectCustomerCategory68() {
  return request({
    url: '/foundation/customerCategory68/treeselect',
    method: 'get'
  })
}

// 查询客户68分类详情
export function getCustomerCategory68(id) {
  return request({
    url: '/foundation/customerCategory68/' + id,
    method: 'get'
  })
}

// 新增客户68分类
export function addCustomerCategory68(data) {
  return request({
    url: '/foundation/customerCategory68',
    method: 'post',
    data: data
  })
}

// 修改客户68分类
export function updateCustomerCategory68(data) {
  return request({
    url: '/foundation/customerCategory68',
    method: 'put',
    data: data
  })
}

// 删除客户68分类（逻辑删除）
export function delCustomerCategory68(id) {
  return request({
    url: '/foundation/customerCategory68/' + id,
    method: 'delete'
  })
}

// 同步：以标准 fd_category68 为蓝本更新/新增
export function syncCustomerCategory68() {
  return request({
    url: '/foundation/customerCategory68/sync',
    method: 'post'
  })
}

// 查询当前客户的68分类操作记录
export function getCustomerCategory68Log() {
  return request({
    url: '/foundation/customerCategory68/log',
    method: 'get'
  })
}

// 按某条客户68分类ID查询操作记录
export function getCustomerCategory68LogByTarget(targetId) {
  return request({
    url: '/foundation/customerCategory68/log/target/' + targetId,
    method: 'get'
  })
}

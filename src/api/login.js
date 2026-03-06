import request from '@/utils/request'

// 登录方法（customerId 优先用于客户校验，无则传 customerCode）
export function login(username, password, code, uuid, customerId, customerCode) {
  const data = {
    username,
    password,
    code,
    uuid,
    customerId: customerId || undefined,
    customerCode: customerCode || undefined
  }
  return request({
    url: '/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 登录页客户下拉选项（未登录可访问）
export function getCustomerOptions() {
  return request({
    url: '/getCustomerOptions',
    headers: {
      isToken: false
    },
    method: 'get'
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息（设备前端使用设备专用接口）
export function getInfo() {
  return request({
    url: '/getEquipmentInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}
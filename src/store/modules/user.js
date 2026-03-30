import { login, logout, getInfo, switchTenant } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    userId: '',
    avatar: '',
    roles: [],
    permissions: [],
    // 租户信息：customerName 用于首页展示；customerId、customerCode 供请求使用，界面不展示
    tenant: null
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_ID: (state, userId) => {
      state.userId = userId
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_TENANT: (state, tenant) => {
      state.tenant = tenant
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      const customerId = userInfo.customerId ? userInfo.customerId.trim() : ''
      const customerCode = userInfo.customerCode ? userInfo.customerCode.trim() : ''
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid, customerId, customerCode).then(res => {
          setToken(res.token)
          commit('SET_TOKEN', res.token)
          // 登录响应中带回租户信息，立即写入会话，供请求头 X-Tenant-Id 与租户数据隔离使用（仿照耗材系统）
          if (res.tenant) {
            commit('SET_TENANT', res.tenant)
          } else {
            commit('SET_TENANT', null)
          }
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          const user = res.user
          const avatar = (user.avatar == "" || user.avatar == null) ? require("@/assets/images/profile.jpg") : process.env.VUE_APP_BASE_API + user.avatar;
          if (res.roles && res.roles.length > 0) {
            commit('SET_ROLES', res.roles)
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
          }
          // 权限始终按后端返回设置，避免无角色用户有按钮权限却不显示（如科室维护新增）
          if (res.permissions != null) {
            commit('SET_PERMISSIONS', Array.isArray(res.permissions) ? res.permissions : [...res.permissions])
          }
          commit('SET_NAME', user.userName)
          commit('SET_ID', user.userId)
          commit('SET_AVATAR', avatar)
          if (res.tenant) {
            commit('SET_TENANT', res.tenant)
          } else {
            commit('SET_TENANT', null)
          }
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          commit('SET_TENANT', null)
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_TENANT', null)
        removeToken()
        resolve()
      })
    },
    // 已登录平台管理员切换租户，重签 token 并刷新上下文
    SwitchTenant({ commit, dispatch }, payload) {
      const customerId = payload && payload.customerId ? String(payload.customerId).trim() : ''
      const systemType = payload && payload.systemType ? payload.systemType : 'equipment'
      return new Promise((resolve, reject) => {
        if (!customerId) {
          reject(new Error('请选择租户'))
          return
        }
        switchTenant(customerId, systemType).then(res => {
          const token = res && res.token
          if (!token) {
            reject(new Error('切换失败：未返回 token'))
            return
          }
          setToken(token)
          commit('SET_TOKEN', token)
          if (res.tenant) {
            commit('SET_TENANT', res.tenant)
          } else {
            commit('SET_TENANT', null)
          }
          dispatch('GetInfo').then(() => resolve(res)).catch(reject)
        }).catch(reject)
      })
    }
  }
}

export default user

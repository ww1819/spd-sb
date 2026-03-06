/**
 * SaaS 多租户 Mixin
 * 为业务页面提供统一的租户上下文，保证提交/查询时使用当前租户 ID，避免跨租户数据错乱
 */
export default {
  computed: {
    /** 当前租户完整信息 { customerId, customerCode, customerName } */
    tenant() {
      return this.$store.getters.tenant || null
    },
    /** 当前租户 ID，提交表单、列表参数等使用 */
    customerId() {
      return this.$store.getters.customerId || ''
    },
    /** 当前租户名称，用于展示 */
    tenantName() {
      const t = this.$store.getters.tenant
      return (t && t.customerName) ? t.customerName : ''
    },
    /** 是否为租户用户（已选租户），用于控制是否展示租户相关逻辑 */
    isTenantUser() {
      return !!this.$store.getters.customerId
    }
  }
}

<template>
  <div class="app-container">
    <el-card shadow="never" class="switch-card">
      <div slot="header" class="clearfix">
        <span>租户选择</span>
      </div>
      <el-alert
        title="平台管理员切换后将以所选租户 super_01 身份进入系统，后续操作会以该租户用户记录。"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px;"
      />
      <el-form label-width="100px" size="small">
        <el-form-item label="目标租户">
          <el-select
            v-model="customerId"
            filterable
            clearable
            placeholder="请选择租户"
            style="width: 420px;"
          >
            <el-option
              v-for="item in customerOptions"
              :key="item.customerId"
              :label="`${item.customerCode || '-'} ${item.customerName || ''}`"
              :value="item.customerId"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="switching" @click="handleSwitch">切换并进入</el-button>
          <el-button @click="$router.push('/')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getCustomerOptions } from '@/api/login'

export default {
  name: 'TenantSwitchPage',
  data() {
    return {
      customerId: '',
      customerOptions: [],
      switching: false
    }
  },
  created() {
    this.loadOptions()
  },
  methods: {
    async loadOptions() {
      try {
        const res = await getCustomerOptions()
        this.customerOptions = (res && res.data) || []
      } catch (e) {
        this.customerOptions = []
      }
    },
    async handleSwitch() {
      if (!this.customerId) {
        this.$message.warning('请选择租户')
        return
      }
      this.switching = true
      try {
        await this.$store.dispatch('SwitchTenant', {
          customerId: this.customerId,
          systemType: 'equipment'
        })
        this.$message.success('租户切换成功，正在刷新会话...')
        window.location.href = '/index'
      } catch (e) {
        this.$message.error((e && e.message) || '租户切换失败')
      } finally {
        this.switching = false
      }
    }
  }
}
</script>

<style scoped>
.switch-card {
  max-width: 680px;
}
</style>

<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户编码" prop="customerCode">
        <el-input
          v-model="queryParams.customerCode"
          placeholder="请输入客户编码"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="客户状态"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['hc:system:customer:list']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['hc:system:customer:query']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['hc:system:customer:list']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-warning-outline"
          size="small"
          @click="openFullInitDialog"
          v-hasPermi="['hc:system:customer:initDb']"
        >全库初始化</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="客户编号" prop="customerId" width="220" show-overflow-tooltip />
      <el-table-column label="租户类型" prop="tenantKey" width="120" show-overflow-tooltip />
      <el-table-column label="客户名称" prop="customerName" min-width="160" show-overflow-tooltip />
      <el-table-column label="客户编码" prop="customerCode" width="140" show-overflow-tooltip />
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
            {{ scope.row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="耗材系统计划停用时间" align="center" width="190">
        <template slot-scope="scope">
          <span>{{ scope.row.hcPlannedDisableTime ? parseTime(scope.row.hcPlannedDisableTime, '{y}-{m}-{d} {h}:{i}') : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="设备系统计划停用时间" align="center" width="190">
        <template slot-scope="scope">
          <span>{{ scope.row.plannedDisableTime ? parseTime(scope.row.plannedDisableTime, '{y}-{m}-{d} {h}:{i}') : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="620" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['hc:system:customer:query']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-video-pause"
            @click="handleChangeStatus(scope.row, '1')"
            v-hasPermi="['hc:system:customer:query']"
            v-if="scope.row.status === '0'"
          >停用</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-video-play"
            @click="handleChangeStatus(scope.row, '0')"
            v-hasPermi="['hc:system:customer:query']"
            v-if="scope.row.status === '1'"
          >启用</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-operation"
            @click="handleAssignMenu(scope.row)"
            v-hasPermi="['hc:system:customer:query']"
          >菜单权限</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-refresh-left"
            @click="handleResetEquipment(scope.row)"
            v-hasPermi="['hc:system:customer:query']"
          >设备功能重置</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-refresh-right"
            @click="handleResetMaterial(scope.row)"
            v-hasPermi="['hc:system:customer:query']"
          >耗材功能重置</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-document"
            @click="handleStatusLog(scope.row)"
            v-hasPermi="['hc:system:customer:query']"
          >启停用记录</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['hc:system:customer:list']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            class="text-danger"
            icon="el-icon-remove-outline"
            @click="handlePurgeHc(scope.row)"
            v-hasPermi="['hc:system:customer:purgeHc']"
          >清理耗材数据</el-button>
          <el-button
            size="mini"
            type="text"
            class="text-danger"
            icon="el-icon-delete"
            @click="handlePurgeEq(scope.row)"
            v-hasPermi="['sb:system:customer:purgeEq']"
          >清理设备数据</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改客户 -->
    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item v-if="!form.customerId" label="租户类型" prop="tenantKey">
          <el-select
            v-model="form.tenantKey"
            placeholder="请选择代码内租户类型（与条件分支关联）"
            filterable
            style="width: 100%"
            @change="onTenantKeyChange"
          >
            <el-option
              v-for="item in tenantEnumList"
              :key="item.name"
              :label="item.displayName + ' (' + item.name + ')'"
              :value="item.name"
            >
              <span>{{ item.displayName }}</span>
              <span style="color: #8492a6; font-size: 12px; margin-left: 8px;">{{ item.name }} / {{ item.branchKey }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.customerId && form.tenantKey" label="租户类型">
          <el-input :value="form.tenantKey" disabled />
        </el-form-item>
        <el-form-item v-if="!form.customerId && form.tenantKey" label="客户编号(自动)">
          <el-input :value="selectedTenantEnum ? selectedTenantEnum.customerId : ''" disabled />
        </el-form-item>
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="客户编码" prop="customerCode">
          <el-input
            v-model="form.customerCode"
            :placeholder="selectedTenantEnum ? '默认: ' + selectedTenantEnum.customerCode : '请输入或由租户类型自动带出'"
            maxlength="64"
            show-word-limit
            :disabled="!!selectedTenantEnum"
          />
        </el-form-item>
        <el-form-item label="耗材系统计划停用时间" prop="hcPlannedDisableTime">
          <el-date-picker
            v-model="form.hcPlannedDisableTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="到达后租户无法使用耗材系统（可选）"
            style="width: 100%"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="设备系统计划停用时间" prop="plannedDisableTime">
          <el-date-picker
            v-model="form.plannedDisableTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="到达后租户无法使用设备系统（可选）"
            style="width: 100%"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="全库初始化（高危）" :visible.sync="openFullInit" width="520px" append-to-body @close="fullInitTokenInput = ''">
      <el-alert type="error" :closable="false" show-icon title="将清空所有租户与业务数据，仅保留 admin 与平台菜单/字典等。执行前请务必备份数据库。" style="margin-bottom: 12px" />
      <p style="color:#606266;font-size:13px;margin-bottom:8px">请在下方输入确认口令（区分大小写）：</p>
      <el-input v-model="fullInitTokenInput" placeholder="CONFIRM_PURGE_ALL_TENANT_DATA" clearable />
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" :disabled="fullInitTokenInput !== FULL_INIT_TOKEN" @click="submitFullInit">确认执行</el-button>
        <el-button @click="openFullInit = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 启停用操作（直接输入原因） -->
    <el-dialog :title="statusDialogTitle" :visible.sync="openStatus" width="480px" append-to-body>
      <el-form ref="statusForm" :model="statusForm" :rules="statusRules" label-width="80px">
        <el-form-item label="客户名称">
          <el-input v-model="statusForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="原因" prop="statusChangeReason">
          <el-input v-model="statusForm.statusChangeReason" type="textarea" :placeholder="statusForm.status === '1' ? '请输入停用原因' : '请输入启用原因'" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitStatusForm">确 定</el-button>
        <el-button @click="openStatus = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 启停用记录与时间段（耗材侧 hc_customer_*） -->
    <el-dialog title="启停用记录与时间段" :visible.sync="openLog" width="800px" append-to-body>
      <div class="log-dialog-header">{{ logForm.customerName }}</div>
      <el-tabs v-model="activeLogTab">
        <el-tab-pane label="启停用记录" name="statusLog">
          <el-table :data="statusLogList" border size="small" max-height="360">
            <el-table-column label="操作时间" prop="operateTime" width="170">
              <template slot-scope="scope">
                {{ parseTime(scope.row.operateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small">
                  {{ scope.row.status === '0' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作人" prop="operateBy" width="120" />
            <el-table-column label="原因" prop="reason" min-width="200" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="启停用时间段" name="periodLog">
          <el-table :data="periodLogList" border size="small" max-height="360">
            <el-table-column label="类型" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.periodType === 'usage' ? 'success' : 'info'" size="small">
                  {{ scope.row.periodType === 'usage' ? '使用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="开始时间" prop="startTime" width="170">
              <template slot-scope="scope">
                {{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
              </template>
            </el-table-column>
            <el-table-column label="结束时间" prop="endTime" width="170">
              <template slot-scope="scope">
                {{ scope.row.endTime ? parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') : '至今' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button @click="openLog = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 分配菜单权限 -->
    <el-dialog title="客户菜单权限" :visible.sync="openMenu" width="480px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="客户名称">
          <el-input v-model="menuForm.customerName" disabled />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="menuExpand" @change="handleMenuTreeExpand">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleMenuTreeNodeAll">全选/全不选</el-checkbox>
          <el-checkbox v-model="menuCheckStrictly" @change="handleMenuTreeConnect">父子联动</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuTree"
            node-key="menuId"
            :check-strictly="!menuCheckStrictly"
            :default-expand-all="menuExpand"
            empty-text="加载中，请稍候"
            :props="{ label: 'menuName', children: 'children' }"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitMenuForm">确 定</el-button>
        <el-button @click="openMenu = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCustomer,
  getCustomer,
  addCustomer,
  updateCustomer,
  delCustomer,
  changeCustomerStatus,
  getCustomerMenuIds,
  saveCustomerMenus,
  getTenantEnumList,
  resetEquipmentFunctions,
  resetMaterialFunctions
} from '@/api/system/customer'
import { getCustomerStatusLogs, getCustomerPeriodLogs, initFullDatabase, purgeConsumablesData, purgeEquipmentData } from '@/api/material/customer'
import { treeselectForCustomerAssign } from '@/api/system/menu'

export default {
  name: 'HcCustomer',
  dicts: ['sys_normal_disable'],
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      customerList: [],
      title: '',
      open: false,
      openMenu: false,
      openStatus: false,
      openLog: false,
      statusForm: { customerId: '', customerName: '', status: '0', statusChangeReason: '' },
      statusRules: {
        statusChangeReason: [{
          required: true,
          validator: (rule, value, cb) => {
            if (!value || !String(value).trim()) {
              const msg = this.statusForm.status === '1' ? '请输入停用原因' : '请输入启用原因'
              cb(new Error(msg))
            } else {
              cb()
            }
          },
          trigger: 'blur'
        }]
      },
      statusDialogTitle: '启停用客户',
      logForm: { customerId: '', customerName: '' },
      activeLogTab: 'statusLog',
      statusLogList: [],
      periodLogList: [],
      menuOptions: [],
      menuExpand: false,
      menuNodeAll: false,
      menuCheckStrictly: true,
      menuForm: { customerId: '', customerName: '' },
      openFullInit: false,
      fullInitTokenInput: '',
      FULL_INIT_TOKEN: 'CONFIRM_PURGE_ALL_TENANT_DATA',
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerName: undefined,
        customerCode: undefined,
        status: undefined
      },
      tenantEnumList: [],
      form: {},
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      rules: {
        customerName: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
        tenantKey: [{
          required: true,
          validator: (rule, value, cb) => {
            if (this.form.customerId) return cb()
            if (!value || !String(value).trim()) {
              cb(new Error('请选择代码内租户类型'))
            } else {
              cb()
            }
          },
          trigger: 'change'
        }]
      }
    }
  },
  computed: {
    selectedTenantEnum() {
      if (!this.form.tenantKey || !this.tenantEnumList.length) return null
      return this.tenantEnumList.find(t => t.name === this.form.tenantKey) || null
    }
  },
  created() {
    this.getList()
    getTenantEnumList().then(res => {
      this.tenantEnumList = res.data || []
    }).catch(() => { this.tenantEnumList = [] })
  },
  methods: {
    getList() {
      this.loading = true
      listCustomer(this.queryParams).then(res => {
        this.customerList = res.rows || []
        this.total = res.total || 0
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    cancel() {
      this.open = false
      this.resetForm('form')
      this.form = {}
    },
    reset() {
      this.form = {
        customerId: undefined,
        customerName: undefined,
        customerCode: undefined,
        tenantKey: undefined,
        status: '0',
        hcStatus: '0',
        hcPlannedDisableTime: undefined,
        plannedDisableTime: undefined,
        remark: undefined
      }
      this.resetForm('form')
    },
    onTenantKeyChange(val) {
      const item = this.tenantEnumList.find(t => t.name === val)
      if (item) {
        this.form.customerCode = item.customerCode
      }
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增客户'
    },
    handleUpdate(row) {
      this.reset()
      const id = row.customerId || this.ids[0]
      getCustomer(id).then(res => {
        this.form = res.data
        this.open = true
        this.title = '修改客户'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.customerId) {
          updateCustomer(this.form).then(() => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
        } else {
          addCustomer(this.form).then(() => {
            this.$modal.msgSuccess('新增成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      const ids = row.customerId ? [row.customerId] : this.ids
      this.$modal.confirm('是否确认删除所选客户？').then(() => {
        return delCustomer(ids[0])
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.customerId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAssignMenu(row) {
      this.menuForm = { customerId: row.customerId, customerName: row.customerName }
      this.openMenu = true
      this.menuOptions = []
      Promise.all([
        treeselectForCustomerAssign(),
        getCustomerMenuIds(row.customerId)
      ]).then(([treeRes, idsRes]) => {
        this.menuOptions = treeRes.data || []
        const ids = idsRes.data || []
        this.$nextTick(() => {
          if (this.$refs.menuTree) {
            this.$refs.menuTree.setCheckedKeys(ids.map(String))
          }
        })
      })
    },
    handleMenuTreeExpand(v) {
      const tree = this.$refs.menuTree
      if (!tree) return
      const nodes = (tree.store && tree.store.nodesMap) ? Object.values(tree.store.nodesMap) : []
      nodes.forEach(n => { n.expanded = v })
    },
    handleMenuTreeNodeAll(v) {
      const tree = this.$refs.menuTree
      if (!tree) return
      if (v) {
        tree.setCheckedNodes(this.menuOptions)
      } else {
        tree.setCheckedKeys([])
      }
    },
    handleMenuTreeConnect(v) {
      this.menuCheckStrictly = v
    },
    handleChangeStatus(row, status) {
      this.statusForm = {
        customerId: row.customerId,
        customerName: row.customerName,
        status: status,
        statusChangeReason: ''
      }
      this.statusDialogTitle = status === '0' ? '启用客户' : '停用客户'
      this.openStatus = true
      this.$nextTick(() => this.$refs.statusForm && this.$refs.statusForm.clearValidate())
    },
    submitStatusForm() {
      this.$refs.statusForm.validate(valid => {
        if (!valid) return
        changeCustomerStatus(this.statusForm).then(() => {
          this.$modal.msgSuccess('操作成功')
          this.openStatus = false
          this.getList()
        })
      })
    },
    /** 启停用记录与时间段：耗材侧接口 hc_customer_status_log / hc_customer_period_log */
    handleStatusLog(row) {
      this.logForm = { customerId: row.customerId, customerName: row.customerName }
      this.activeLogTab = 'statusLog'
      this.openLog = true
      this.statusLogList = []
      this.periodLogList = []
      getCustomerStatusLogs(row.customerId).then(res => {
        this.statusLogList = res.data || []
      })
      getCustomerPeriodLogs(row.customerId).then(res => {
        this.periodLogList = res.data || []
      })
    },
    handleResetEquipment(row) {
      const name = row.customerName || row.customerId
      this.$modal.confirm('是否确认将客户“' + name + '”的设备功能重置？将把默认对客户开放的权限开放给客户、super 组及 super_01；若 super 组或 super_01 不存在则会创建。').then(() => {
        return resetEquipmentFunctions(row.customerId)
      }).then(() => {
        this.$modal.msgSuccess('设备功能重置成功')
        this.getList()
      }).catch(() => {})
    },
    handleResetMaterial(row) {
      const name = row.customerName || row.customerId
      this.$modal.confirm('是否确认将客户“' + name + '”的耗材功能重置？将重置耗材客户菜单权限、super 岗位及 super_01 的菜单权限为系统设置下非平台管理功能；若 super 岗位或 super_01 不存在则会创建。').then(() => {
        return resetMaterialFunctions(row.customerId)
      }).then(() => {
        this.$modal.msgSuccess('耗材功能重置成功')
        this.getList()
      }).catch(() => {})
    },
    openFullInitDialog() {
      this.fullInitTokenInput = ''
      this.openFullInit = true
    },
    submitFullInit() {
      if (this.fullInitTokenInput !== this.FULL_INIT_TOKEN) {
        this.$modal.msgError('口令不正确')
        return
      }
      initFullDatabase(this.fullInitTokenInput).then(res => {
        this.$modal.msgSuccess((res && res.msg) || '已提交全库初始化')
        this.openFullInit = false
        this.fullInitTokenInput = ''
      }).catch(() => {})
    },
    handlePurgeHc(row) {
      const name = row.customerName || row.customerId
      this.$modal.confirm('确认物理删除租户「' + name + '」下全部耗材业务数据（含该租户用户，不删除客户主档）？此操作不可恢复。').then(() => {
        return purgeConsumablesData(row.customerId)
      }).then(res => {
        this.$modal.msgSuccess((res && res.msg) || '清理完成')
        this.getList()
      }).catch(() => {})
    },
    handlePurgeEq(row) {
      const name = row.customerName || row.customerId
      this.$modal.confirm('确认物理删除租户「' + name + '」下全部设备业务数据（不删除客户主档）？不可恢复。').then(() => {
        return purgeEquipmentData(row.customerId)
      }).then(res => {
        this.$modal.msgSuccess((res && res.msg) || '清理完成')
        this.getList()
      }).catch(() => {})
    },
    submitMenuForm() {
      const tree = this.$refs.menuTree
      const checkedKeys = tree.getCheckedKeys()
      const halfKeys = tree.getHalfCheckedKeys()
      const menuIds = [...checkedKeys, ...halfKeys].map(String)
      saveCustomerMenus(this.menuForm.customerId, menuIds).then(() => {
        this.$modal.msgSuccess('保存成功')
        this.openMenu = false
      })
    }
  }
}
</script>

<style scoped>
.log-dialog-header {
  margin-bottom: 12px;
  font-weight: 600;
  color: #303133;
}
.text-danger {
  color: #f56c6c;
}
</style>

<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="模糊" clearable style="width:140px" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:120px">
          <el-option label="草稿" value="draft" />
          <el-option label="已提交待审核" value="audited" />
          <el-option label="盘点中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item label="盘点类型" prop="inventoryType">
        <el-select v-model="queryParams.inventoryType" placeholder="全部" clearable style="width:160px">
          <el-option v-for="dict in dict.type.eq_inventory_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd" v-hasPermi="['equipment:assetInventory:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="small" :disabled="single" @click="handleUpdate" v-hasPermi="['equipment:assetInventory:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="small" :disabled="single" @click="handleDelete" v-hasPermi="['equipment:assetInventory:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="small" @click="handleExport" v-hasPermi="['equipment:assetInventory:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-s-promotion" size="small" :disabled="single" @click="handleSubmit" v-hasPermi="['equipment:assetInventory:submit']">提交审核</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-circle-check" size="small" :disabled="single" @click="handleAudit" v-hasPermi="['equipment:assetInventory:audit']">审核</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="default" plain icon="el-icon-printer" size="small" :disabled="single" @click="handlePrintTask" v-hasPermi="['equipment:assetInventory:list']">生成打印任务</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" height="calc(100vh - 280px)">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="单号" align="center" prop="orderNo" width="150" show-overflow-tooltip />
      <el-table-column label="盘点类型" align="center" prop="inventoryType" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.eq_inventory_type" :value="scope.row.inventoryType"/>
        </template>
      </el-table-column>
      <el-table-column label="盘点范围" align="center" min-width="140" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scopeRowRange(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="110">
        <template slot-scope="scope">
          <span>{{ statusLabel(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="明细数/已盘" align="center" width="100">
        <template slot-scope="scope">
          {{ scope.row.totalCount || 0 }} / {{ scope.row.checkedCount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="制单人" align="center" prop="createBy" width="90" />
      <el-table-column label="制单时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(scope.row)" v-hasPermi="['equipment:assetInventory:query']">详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['equipment:assetInventory:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-s-operation" @click="handleBuildItems(scope.row)" v-hasPermi="['equipment:assetInventory:edit']" v-if="scope.row.status==='draft'">生成明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="640px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="盘点类型" prop="inventoryType">
          <el-select v-model="form.inventoryType" placeholder="请选择" style="width:100%" @change="onInventoryTypeChange">
            <el-option v-for="dict in dict.type.eq_inventory_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.inventoryType==='dept'" label="盘点科室" prop="inventoryDeptId">
          <el-select v-model="form.inventoryDeptId" placeholder="请选择科室" style="width:100%" filterable @change="onDeptChange">
            <el-option v-for="d in deptOptions" :key="d.id" :label="d.deptName || d.name || d.label" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.inventoryType==='category68'" label="68分类" prop="inventoryCategory68Id">
          <treeselect
            v-model="form.inventoryCategory68Id"
            :options="category68OptionsTree"
            :normalizer="normalizerCategory68"
            placeholder="请选择68分类（含下级）"
            style="width:100%"
            @input="onCategory68Change"
          />
        </el-form-item>
        <el-form-item v-if="form.inventoryType==='storage_place'" label="存放地点" prop="storagePlace">
          <el-select v-model="form.storagePlace" placeholder="请选择存放地点" style="width:100%" filterable allow-create>
            <el-option v-for="p in storagePlaceOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划盘点日期" prop="planDate">
          <el-date-picker v-model="form.planDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="盘点单详情" :visible.sync="detailOpen" width="900px" append-to-body>
      <el-descriptions :column="2" border size="small" v-if="detailRow">
        <el-descriptions-item label="单号">{{ detailRow.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(detailRow.status) }}</el-descriptions-item>
        <el-descriptions-item label="盘点类型"><dict-tag :options="dict.type.eq_inventory_type" :value="detailRow.inventoryType"/></el-descriptions-item>
        <el-descriptions-item label="盘点范围">{{ detailRowRange(detailRow) }}</el-descriptions-item>
      </el-descriptions>
      <div class="mt10" v-if="detailRow && detailRow.status==='draft'">
        <el-button size="small" type="primary" icon="el-icon-s-operation" @click="handleBuildItemsFromDetail">根据范围生成明细</el-button>
      </div>
      <el-table :data="detailItems" max-height="360" size="small" class="mt10">
        <el-table-column label="资产名称" prop="name" min-width="120" show-overflow-tooltip />
        <el-table-column label="流水号" prop="equipmentSerialNo" width="100" />
        <el-table-column label="规格" prop="spec" width="90" show-overflow-tooltip />
        <el-table-column label="科室" prop="deptName" width="100" show-overflow-tooltip />
        <el-table-column label="盘点状态" prop="checkStatus" width="90" />
        <el-table-column label="打印状态" prop="printStatus" width="90" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  listAssetInventory,
  getAssetInventory,
  addAssetInventory,
  updateAssetInventory,
  delAssetInventory,
  submitAssetInventory,
  auditAssetInventory,
  printFromInventoryItems,
  buildInventoryItems,
  listStoragePlaces
} from '@/api/equipment/assetInventory'
import { listdepartAll } from '@/api/foundation/depart'
import { treeselectCustomerCategory68 } from '@/api/foundation/customerCategory68'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'AssetInventory',
  components: { Treeselect },
  dicts: ['eq_inventory_type'],
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      dataList: [],
      ids: [],
      single: true,
      multiple: true,
      title: '',
      open: false,
      detailOpen: false,
      detailRow: null,
      detailItems: [],
      deptOptions: [],
      category68OptionsTree: [],
      category68Map: {},
      storagePlaceOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: undefined,
        status: undefined,
        inventoryType: undefined
      },
      form: {},
      rules: {
        inventoryType: [{ required: true, message: '请选择盘点类型', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  methods: {
    loadOptions() {
      const userId = this.$store.getters.userId || this.$store.state.user?.userId
      if (userId) {
        listdepartAll(userId).then(res => {
          this.deptOptions = res.data || res || []
        }).catch(() => { this.deptOptions = [] })
      }
      treeselectCustomerCategory68().then(res => {
        const list = res.data || []
        this.category68OptionsTree = this.normalizeCategory68Tree(list)
        this.category68Map = {}
        this.buildCategory68Map(list)
      }).catch(() => { this.category68OptionsTree = []; this.category68Map = {} })
      listStoragePlaces().then(res => {
        this.storagePlaceOptions = res.data || []
      }).catch(() => { this.storagePlaceOptions = [] })
    },
    normalizeCategory68Tree(nodes) {
      if (!nodes || !nodes.length) return []
      return nodes.map(n => {
        const codeName = (n.category68Code || '') + ' ' + (n.category68Name || '')
        const py = (n.namePinyin || '').trim()
        const label = py ? codeName + ' ' + py : codeName
        return { id: n.id, label, children: n.children && n.children.length ? this.normalizeCategory68Tree(n.children) : undefined }
      })
    },
    buildCategory68Map(nodes) {
      if (!nodes || !nodes.length) return
      nodes.forEach(n => {
        this.category68Map[n.id] = n
        if (n.children && n.children.length) this.buildCategory68Map(n.children)
      })
    },
    normalizerCategory68(node) {
      if (node.children && !node.children.length) delete node.children
      return { id: node.id, label: node.label, children: node.children }
    },
    onInventoryTypeChange() {
      this.form.inventoryDeptId = undefined
      this.form.inventoryDeptName = undefined
      this.form.inventoryCategory68Id = undefined
      this.form.inventoryCategory68Code = undefined
      this.form.storagePlace = undefined
    },
    onDeptChange(id) {
      if (!id) { this.form.inventoryDeptName = undefined; return }
      const d = this.deptOptions.find(x => x.id === id)
      this.form.inventoryDeptName = d ? (d.deptName || d.name || d.label) : undefined
    },
    onCategory68Change(id) {
      if (!id) { this.form.inventoryCategory68Code = undefined; return }
      const node = this.category68Map[id]
      this.form.inventoryCategory68Code = node ? node.category68Code : undefined
    },
    scopeRowRange(row) {
      if (!row) return '-'
      if (row.inventoryType === 'dept') return row.inventoryDeptName || row.inventoryDeptId || '-'
      if (row.inventoryType === 'category68') return (row.inventoryCategory68Code || '') + (row.inventoryCategory68Id ? ' (含下级)' : '') || '-'
      if (row.inventoryType === 'storage_place') return row.storagePlace || '-'
      return '-'
    },
    statusLabel(s) {
      const m = { draft: '草稿', audited: '已提交待审核', in_progress: '盘点中', completed: '已完成', cancelled: '已取消' }
      return m[s] || s || '-'
    },
    getList() {
      this.loading = true
      listAssetInventory(this.queryParams).then(res => {
        this.dataList = res.rows || []
        this.total = res.total || 0
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    reset() {
      this.form = {
        id: undefined,
        inventoryType: undefined,
        inventoryDeptId: undefined,
        inventoryDeptName: undefined,
        inventoryCategory68Id: undefined,
        inventoryCategory68Code: undefined,
        storagePlace: undefined,
        planDate: undefined,
        remark: undefined
      }
      this.rules = { inventoryType: [{ required: true, message: '请选择盘点类型', trigger: 'change' }] }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增盘点单'
    },
    handleUpdate(row) {
      const id = row.id || this.ids[0]
      if (!id) return
      this.reset()
      getAssetInventory(id).then(res => {
        this.form = Object.assign({}, res.data)
        this.open = true
        this.title = '修改盘点单'
      })
    },
    handleDetail(row) {
      getAssetInventory(row.id).then(res => {
        this.detailRow = res.data
        this.detailItems = res.items || []
        this.detailOpen = true
      })
    },
    submitForm() {
      const type = this.form.inventoryType
      const rules = { inventoryType: this.rules.inventoryType }
      if (type === 'dept') rules.inventoryDeptId = [{ required: true, message: '请选择盘点科室', trigger: 'change' }]
      else if (type === 'category68') rules.inventoryCategory68Id = [{ required: true, message: '请选择68分类', trigger: 'change' }]
      else if (type === 'storage_place') rules.storagePlace = [{ required: true, message: '请选择存放地点', trigger: 'change' }]
      this.rules = rules
      this.$refs.form.validate(valid => {
        if (!valid) return
        const req = this.form.id ? updateAssetInventory : addAssetInventory
        req(this.form).then(() => {
          this.$modal.msgSuccess(this.form.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    cancel() {
      this.open = false
    },
    handleDelete(row) {
      const id = row.id || this.ids[0]
      this.$modal.confirm('是否确认删除该盘点单？').then(() => delAssetInventory(id)).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    handleExport() {
      this.download('equipment/assetInventory/export', { ...this.queryParams }, `资产盘点_${new Date().getTime()}.xlsx`)
    },
    handleSubmit() {
      const id = this.ids[0]
      submitAssetInventory(id).then(() => {
        this.$modal.msgSuccess('已提交审核')
        this.getList()
      })
    },
    handleAudit() {
      const id = this.ids[0]
      auditAssetInventory(id).then(() => {
        this.$modal.msgSuccess('审核通过，已进入盘点中')
        this.getList()
      })
    },
    handlePrintTask() {
      const id = this.ids[0]
      printFromInventoryItems({ inventoryId: id }).then(res => {
        const task = res.data
        this.$modal.msgSuccess('已生成打印任务单：' + (task && task.taskNo ? task.taskNo : ''))
      })
    },
    handleBuildItems(row) {
      const id = row.id
      this.$modal.confirm('将根据盘点类型与范围从台账生成明细，已存在明细会被清空。是否继续？').then(() => {
        buildInventoryItems(id).then(res => {
          const count = res.count != null ? res.count : (res.data && res.data.count != null ? res.data.count : 0)
          this.$modal.msgSuccess('已生成 ' + count + ' 条明细')
          this.getList()
        })
      }).catch(() => {})
    },
    handleBuildItemsFromDetail() {
      if (!this.detailRow || !this.detailRow.id) return
      buildInventoryItems(this.detailRow.id).then(res => {
        const count = res.count != null ? res.count : (res.data && res.data.count != null ? res.data.count : 0)
        this.$modal.msgSuccess('已生成 ' + count + ' 条明细')
        getAssetInventory(this.detailRow.id).then(r => {
          this.detailItems = r.items || []
          this.detailRow = r.data
        })
      })
    }
  }
}
</script>

<style scoped>
.mt10 { margin-top: 10px; }
</style>

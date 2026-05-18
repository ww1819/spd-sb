<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="onTabClick">
      <el-tab-pane label="配件档案" name="acc">
        <el-form :model="accQuery" ref="accQueryForm" size="small" :inline="true" class="mb8">
          <el-form-item label="编码" prop="accessoryCode">
            <el-input v-model="accQuery.accessoryCode" clearable placeholder="配件编码" style="width:160px" @keyup.enter.native="loadAccList" />
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input v-model="accQuery.name" clearable placeholder="名称" style="width:160px" @keyup.enter.native="loadAccList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="small" @click="loadAccList">搜索</el-button>
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="small" @click="openAccForm()" v-hasPermi="['equipment:accessory:add']">新增</el-button>
          </el-col>
        </el-row>
        <el-table v-loading="accLoading" :data="accList" height="calc(100vh - 320px)">
          <el-table-column label="编码" prop="accessoryCode" min-width="110" show-overflow-tooltip />
          <el-table-column label="名称" prop="name" min-width="140" show-overflow-tooltip />
          <el-table-column label="规格" prop="spec" min-width="120" show-overflow-tooltip />
          <el-table-column label="单位" prop="unit" width="70" />
          <el-table-column label="厂商" prop="manufacturerName" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" width="140" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="openAccForm(scope.row)" v-hasPermi="['equipment:accessory:edit']">修改</el-button>
              <el-button type="text" size="mini" @click="removeAcc(scope.row)" v-hasPermi="['equipment:accessory:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="accTotal > 0" :total="accTotal" :page.sync="accQuery.pageNum" :limit.sync="accQuery.pageSize" @pagination="loadAccList" />
      </el-tab-pane>

      <el-tab-pane label="配件库存" name="stock">
        <el-form :model="stockQuery" size="small" :inline="true" class="mb8">
          <el-form-item label="编码">
            <el-input v-model="stockQuery.accessoryCode" clearable style="width:140px" @keyup.enter.native="loadStockList" />
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="stockQuery.accessoryName" clearable style="width:140px" @keyup.enter.native="loadStockList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="small" @click="loadStockList">搜索</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="stockLoading" :data="stockList" height="calc(100vh - 280px)">
          <el-table-column label="配件编码" prop="accessoryCode" min-width="110" />
          <el-table-column label="配件名称" prop="accessoryName" min-width="140" show-overflow-tooltip />
          <el-table-column label="仓库编码" prop="warehouseCode" width="120" />
          <el-table-column label="数量" prop="quantity" width="120" align="right" />
        </el-table>
        <pagination v-show="stockTotal > 0" :total="stockTotal" :page.sync="stockQuery.pageNum" :limit.sync="stockQuery.pageSize" @pagination="loadStockList" />
      </el-tab-pane>

      <el-tab-pane label="出入库" name="io">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="small" @click="openIoDialog()" v-hasPermi="['equipment:accessory:io:add']">登记出入库</el-button>
          </el-col>
        </el-row>
        <el-table v-loading="ioLoading" :data="ioList" height="calc(100vh - 280px)">
          <el-table-column label="单据号" prop="ioNo" min-width="200" show-overflow-tooltip />
          <el-table-column label="类型" prop="ioType" width="80" />
          <el-table-column label="业务日期" prop="bizDate" width="120" />
          <el-table-column label="创建时间" prop="createTime" width="160" />
          <el-table-column label="操作" width="100" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="viewIo(scope.row)" v-hasPermi="['equipment:accessory:io:list']">明细</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="ioTotal > 0" :total="ioTotal" :page.sync="ioQuery.pageNum" :limit.sync="ioQuery.pageSize" @pagination="loadIoList" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog :title="accTitle" :visible.sync="accOpen" width="520px" append-to-body>
      <el-form ref="accFormRef" :model="accForm" :rules="accRules" label-width="100px">
        <el-form-item label="配件编码" prop="accessoryCode">
          <el-input v-model="accForm.accessoryCode" :disabled="!!accForm.id" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="accForm.name" maxlength="200" />
        </el-form-item>
        <el-form-item label="规格" prop="spec">
          <el-input v-model="accForm.spec" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="accForm.unit" maxlength="32" />
        </el-form-item>
        <el-form-item label="厂商" prop="manufacturerName">
          <el-input v-model="accForm.manufacturerName" maxlength="200" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="accForm.remark" maxlength="500" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="submitAcc">确 定</el-button>
        <el-button @click="accOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="登记出入库" :visible.sync="ioOpen" width="720px" append-to-body>
      <el-form :model="ioForm" label-width="100px" size="small">
        <el-form-item label="类型" required>
          <el-select v-model="ioForm.ioType" placeholder="请选择" style="width:160px">
            <el-option label="入库 IN" value="IN" />
            <el-option label="出库 OUT" value="OUT" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务日期">
          <el-date-picker v-model="ioForm.bizDate" type="date" value-format="yyyy-MM-dd" placeholder="默认今天" style="width:160px" />
        </el-form-item>
        <el-form-item label="设备ID">
          <el-input v-model="ioForm.equipmentId" placeholder="可选，关联 equipment_info.id" style="width:360px" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="ioForm.remark" maxlength="500" />
        </el-form-item>
      </el-form>
      <div class="mb8">
        <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="addIoLine">增行</el-button>
      </div>
      <el-table :data="ioForm.entries" border size="small">
        <el-table-column label="配件" min-width="220">
          <template slot-scope="scope">
            <el-select v-model="scope.row.accessoryId" filterable placeholder="选择配件" style="width:100%">
              <el-option v-for="a in accOptions" :key="a.id" :label="a.accessoryCode + ' — ' + a.name" :value="a.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="仓库编码" width="130">
          <template slot-scope="scope">
            <el-input v-model="scope.row.warehouseCode" placeholder="默认空" />
          </template>
        </el-table-column>
        <el-table-column label="数量" width="120">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.qty" :min="0.0001" :step="1" :precision="4" controls-position="right" style="width:100%" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="ioForm.entries.splice(scope.$index, 1)">删</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button type="primary" @click="submitIo">提 交</el-button>
        <el-button @click="ioOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="出入库明细" :visible.sync="ioViewOpen" width="640px" append-to-body>
      <el-descriptions v-if="ioViewHeader" :column="1" border size="small">
        <el-descriptions-item label="单据号">{{ ioViewHeader.ioNo }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ ioViewHeader.ioType }}</el-descriptions-item>
        <el-descriptions-item label="业务日期">{{ ioViewHeader.bizDate }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ ioViewHeader.equipmentId || '—' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ ioViewHeader.remark || '—' }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="ioViewEntries" size="small" class="mt12" max-height="280">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column label="配件ID" prop="accessoryId" min-width="200" show-overflow-tooltip />
        <el-table-column label="仓库" prop="warehouseCode" width="100" />
        <el-table-column label="数量" prop="qty" width="100" align="right" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  listAccessory,
  getAccessory,
  addAccessory,
  updateAccessory,
  delAccessory,
  listAccessoryStock,
  listAccessoryIo,
  getAccessoryIo,
  submitAccessoryIo
} from '@/api/equipment/accessory'

export default {
  name: 'EquipmentAccessory',
  data() {
    return {
      activeTab: 'acc',
      accLoading: false,
      accList: [],
      accTotal: 0,
      accQuery: { pageNum: 1, pageSize: 10, accessoryCode: null, name: null },
      accOpen: false,
      accTitle: '',
      accForm: {},
      accRules: {
        accessoryCode: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      },
      accOptions: [],
      stockLoading: false,
      stockList: [],
      stockTotal: 0,
      stockQuery: { pageNum: 1, pageSize: 10, accessoryCode: null, accessoryName: null },
      ioLoading: false,
      ioList: [],
      ioTotal: 0,
      ioQuery: { pageNum: 1, pageSize: 10 },
      ioOpen: false,
      ioForm: { ioType: 'IN', bizDate: null, equipmentId: '', remark: '', entries: [] },
      ioViewOpen: false,
      ioViewHeader: null,
      ioViewEntries: [],
      stockLoaded: false,
      ioLoaded: false
    }
  },
  created() {
    this.loadAccList()
    this.loadAccOptions()
  },
  methods: {
    onTabClick(tab) {
      if (tab.name === 'stock' && !this.stockLoaded) {
        this.stockLoaded = true
        this.loadStockList()
      }
      if (tab.name === 'io' && !this.ioLoaded) {
        this.ioLoaded = true
        this.loadIoList()
      }
    },
    loadAccList() {
      this.accLoading = true
      listAccessory(this.accQuery).then(res => {
        this.accList = res.rows || []
        this.accTotal = res.total || 0
        this.accLoading = false
      }).catch(() => { this.accLoading = false })
    },
    loadAccOptions() {
      listAccessory({ pageNum: 1, pageSize: 500 }).then(res => {
        this.accOptions = res.rows || []
      })
    },
    openAccForm(row) {
      this.accForm = row && row.id ? {} : { id: null, accessoryCode: '', name: '', spec: '', unit: '', manufacturerName: '', remark: '' }
      if (row && row.id) {
        getAccessory(row.id).then(res => {
          this.accForm = Object.assign({}, res.data)
          this.accTitle = '修改配件'
          this.accOpen = true
        })
      } else {
        this.accTitle = '新增配件'
        this.accOpen = true
      }
      this.$nextTick(() => this.$refs.accFormRef && this.$refs.accFormRef.clearValidate())
    },
    submitAcc() {
      this.$refs.accFormRef.validate(valid => {
        if (!valid) return
        const req = this.accForm.id ? updateAccessory(this.accForm) : addAccessory(this.accForm)
        req.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.accOpen = false
          this.loadAccList()
          this.loadAccOptions()
        })
      })
    },
    removeAcc(row) {
      this.$modal.confirm('确认删除该配件？').then(() => delAccessory(row.id)).then(() => {
        this.$modal.msgSuccess('已删除')
        this.loadAccList()
        this.loadAccOptions()
      }).catch(() => {})
    },
    loadStockList() {
      this.stockLoading = true
      listAccessoryStock(this.stockQuery).then(res => {
        this.stockList = res.rows || []
        this.stockTotal = res.total || 0
        this.stockLoading = false
      }).catch(() => { this.stockLoading = false })
    },
    loadIoList() {
      this.ioLoading = true
      listAccessoryIo(this.ioQuery).then(res => {
        this.ioList = res.rows || []
        this.ioTotal = res.total || 0
        this.ioLoading = false
      }).catch(() => { this.ioLoading = false })
    },
    openIoDialog() {
      this.ioForm = { ioType: 'IN', bizDate: null, equipmentId: '', remark: '', entries: [{ accessoryId: '', warehouseCode: '', qty: 1 }] }
      this.loadAccOptions()
      this.ioOpen = true
    },
    addIoLine() {
      this.ioForm.entries.push({ accessoryId: '', warehouseCode: '', qty: 1 })
    },
    submitIo() {
      if (!this.ioForm.ioType) {
        this.$modal.msgError('请选择类型')
        return
      }
      const entries = (this.ioForm.entries || []).filter(e => e.accessoryId && e.qty > 0).map(e => ({
        accessoryId: e.accessoryId,
        warehouseCode: (e.warehouseCode || '').trim(),
        qty: e.qty
      }))
      if (!entries.length) {
        this.$modal.msgError('请填写至少一行有效明细')
        return
      }
      const body = {
        ioType: this.ioForm.ioType,
        bizDate: this.ioForm.bizDate || undefined,
        equipmentId: this.ioForm.equipmentId || undefined,
        remark: this.ioForm.remark,
        entries
      }
      submitAccessoryIo(body).then(() => {
        this.$modal.msgSuccess('提交成功')
        this.ioOpen = false
        this.loadIoList()
        this.loadStockList()
      })
    },
    viewIo(row) {
      getAccessoryIo(row.id).then(res => {
        this.ioViewHeader = res.data.header
        this.ioViewEntries = res.data.entries || []
        this.ioViewOpen = true
      })
    }
  }
}
</script>

<style scoped>
.mt12 { margin-top: 12px; }
.mb8 { margin-bottom: 8px; }
</style>

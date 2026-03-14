<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="名称/简码" prop="name">
        <el-input v-model="queryParams.name" placeholder="名称或拼音简码模糊搜索" clearable @keyup.enter.native="handleQuery" style="width:200px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd" v-hasPermi="['equipment:assetLedger:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="small" :disabled="single" @click="handleUpdate" v-hasPermi="['equipment:assetLedger:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="small" :disabled="single" @click="handleDelete" v-hasPermi="['equipment:assetLedger:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="small" @click="handleExport" v-hasPermi="['equipment:assetLedger:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" height="calc(100vh - 280px)">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备流水号" align="center" prop="equipmentSerialNo" width="100" show-overflow-tooltip />
      <el-table-column label="68档案号" align="center" prop="category68ArchiveNo" width="110" show-overflow-tooltip />
      <el-table-column label="名称" align="center" prop="name" min-width="140" show-overflow-tooltip />
      <el-table-column label="规格" align="center" prop="spec" width="100" show-overflow-tooltip />
      <el-table-column label="型号" align="center" prop="model" width="90" show-overflow-tooltip />
      <el-table-column label="品牌" align="center" prop="brandName" width="90" show-overflow-tooltip />
      <el-table-column label="生产厂家" align="center" prop="manufacturerName" width="100" show-overflow-tooltip />
      <el-table-column label="使用状态" align="center" prop="useStatusName" width="90">
        <template slot-scope="scope">
          <dict-tag v-if="scope.row.useStatus" :options="dict.type.eq_use_status" :value="scope.row.useStatus" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="维修状态" align="center" prop="repairStatusName" width="90">
        <template slot-scope="scope">
          <dict-tag v-if="scope.row.repairStatus" :options="dict.type.eq_repair_status" :value="scope.row.repairStatus" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="所属科室" align="center" prop="deptName" width="100" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['equipment:assetLedger:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['equipment:assetLedger:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="客户68分类" prop="category68Id">
                  <el-select v-model="form.category68Id" placeholder="请选择" clearable filterable style="width:100%" @change="onCategory68Change">
                    <el-option v-for="item in category68Options" :key="item.id" :label="(item.category68Code || '') + ' ' + (item.category68Name || '')" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备流水号" prop="equipmentSerialNo">
                  <el-input v-model="form.equipmentSerialNo" placeholder="不填则自动生成" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="名称拼音简码" prop="namePinyin">
                  <el-input v-model="form.namePinyin" placeholder="支持名称/简码模糊搜索" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="规格" prop="spec">
                  <el-input v-model="form.spec" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="型号" prop="model">
                  <el-input v-model="form.model" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="注册证号" prop="registerCertNo">
                  <el-input v-model="form.registerCertNo" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="品牌" prop="brandId">
                  <el-select v-model="form.brandId" placeholder="请选择" clearable filterable style="width:100%" @change="onBrandChange">
                    <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="生产厂家" prop="manufacturerId">
                  <el-select v-model="form.manufacturerId" placeholder="请选择" clearable filterable style="width:100%" @change="onManufacturerChange">
                    <el-option v-for="item in manufacturerOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="供应商" prop="supplierId">
                  <el-select v-model="form.supplierId" placeholder="请选择" clearable filterable style="width:100%" @change="onSupplierChange">
                    <el-option v-for="item in supplierOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="机身序列号(SN)" prop="serialNumber">
                  <el-input v-model="form.serialNumber" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单位" prop="unit">
                  <el-input v-model="form.unit" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="价值与科室" name="value">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="原值" prop="originalValue">
                  <el-input-number v-model="form.originalValue" :min="0" :precision="2" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="净值" prop="netValue">
                  <el-input-number v-model="form.netValue" :min="0" :precision="2" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="所属科室ID" prop="deptId">
                  <el-input v-model="form.deptId" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属科室名称" prop="deptName">
                  <el-input v-model="form.deptName" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="存放地点" prop="storagePlace">
              <el-input v-model="form.storagePlace" placeholder="请输入" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="日期" name="dates">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="验收日期" prop="acceptanceDate">
                  <el-date-picker v-model="form.acceptanceDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="入库日期" prop="storageDate">
                  <el-date-picker v-model="form.storageDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="出厂日期" prop="manufactureDate">
                  <el-date-picker v-model="form.manufactureDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="报废日期" prop="scrapDate">
                  <el-date-picker v-model="form.scrapDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="预计报废日期" prop="expectedScrapDate">
              <el-date-picker v-model="form.expectedScrapDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="分类与计量" name="category">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="资产分类" prop="assetCategoryId">
                  <el-select v-model="form.assetCategoryId" placeholder="请选择" clearable filterable style="width:100%" @change="onAssetCategoryChange">
                    <el-option v-for="item in assetCategoryOptions" :key="item.id" :label="item.categoryName" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="计量器具分类" prop="measuringCategoryId">
                  <el-select v-model="form.measuringCategoryId" placeholder="请选择" clearable filterable style="width:100%" @change="onMeasuringCategoryChange">
                    <el-option v-for="item in measuringCategoryOptions" :key="item.id" :label="item.categoryName" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="上次计量检定日期" prop="lastCalibrationDate">
                  <el-date-picker v-model="form.lastCalibrationDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="下次计量检定日期" prop="nextCalibrationDate">
                  <el-date-picker v-model="form.nextCalibrationDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="状态与保修" name="status">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="使用状态" prop="useStatus">
                  <el-select v-model="form.useStatus" placeholder="请选择" clearable style="width:100%">
                    <el-option v-for="dict in dict.type.eq_use_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="维修状态" prop="repairStatus">
                  <el-select v-model="form.repairStatus" placeholder="请选择" clearable style="width:100%">
                    <el-option v-for="dict in dict.type.eq_repair_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="标签打印状态" prop="labelPrintStatus">
                  <el-select v-model="form.labelPrintStatus" placeholder="请选择" clearable style="width:100%">
                    <el-option v-for="dict in dict.type.eq_label_print_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="保修类型" prop="warrantyType">
                  <el-select v-model="form.warrantyType" placeholder="请选择" clearable style="width:100%">
                    <el-option v-for="dict in dict.type.eq_warranty_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="保修期限(天)" prop="warrantyDays">
                  <el-input-number v-model="form.warrantyDays" :min="0" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="保修开始时间" prop="warrantyStartTime">
                  <el-date-picker v-model="form.warrantyStartTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="保修结束时间" prop="warrantyEndTime">
              <el-date-picker v-model="form.warrantyEndTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAssetLedger, getAssetLedger, addAssetLedger, updateAssetLedger, delAssetLedger } from '@/api/equipment/assetLedger'
import { listCustomerCategory68 } from '@/api/foundation/customerCategory68'
import { listBrand } from '@/api/equipment/brand'
import { listManufacturer } from '@/api/equipment/manufacturer'
import { listSupplier } from '@/api/equipment/supplier'
import { listAssetCategory } from '@/api/equipment/assetCategory'
import { listMeasuringCategory } from '@/api/equipment/measuringCategory'

export default {
  name: 'CustomerAssetLedger',
  dicts: ['eq_use_status', 'eq_repair_status', 'eq_warranty_type', 'eq_label_print_status'],
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      showSearch: true,
      total: 0,
      dataList: [],
      title: '',
      open: false,
      activeTab: 'basic',
      queryParams: { pageNum: 1, pageSize: 10, name: null },
      form: {},
      rules: { name: [{ required: true, message: '名称不能为空', trigger: 'blur' }] },
      category68Options: [],
      brandOptions: [],
      manufacturerOptions: [],
      supplierOptions: [],
      assetCategoryOptions: [],
      measuringCategoryOptions: []
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  methods: {
    loadOptions() {
      listCustomerCategory68({ pageNum: 1, pageSize: 2000 }).then(res => {
        this.category68Options = res.rows || []
      })
      listBrand({ pageNum: 1, pageSize: 500 }).then(res => { this.brandOptions = res.rows || [] })
      listManufacturer({ pageNum: 1, pageSize: 500 }).then(res => { this.manufacturerOptions = res.rows || [] })
      listSupplier({ pageNum: 1, pageSize: 500 }).then(res => { this.supplierOptions = res.rows || [] })
      listAssetCategory({ pageNum: 1, pageSize: 500 }).then(res => { this.assetCategoryOptions = res.rows || [] })
      listMeasuringCategory({ pageNum: 1, pageSize: 500 }).then(res => { this.measuringCategoryOptions = res.rows || [] })
    },
    onCategory68Change(id) {
      const item = this.category68Options.find(r => r.id === id)
      if (item) { this.form.category68Code = item.category68Code }
    },
    onBrandChange(id) {
      const item = this.brandOptions.find(r => r.id === id)
      if (item) { this.form.brandName = item.name }
    },
    onManufacturerChange(id) {
      const item = this.manufacturerOptions.find(r => r.id === id)
      if (item) { this.form.manufacturerName = item.name }
    },
    onSupplierChange(id) {
      const item = this.supplierOptions.find(r => r.id === id)
      if (item) { this.form.supplierName = item.name }
    },
    onAssetCategoryChange(id) {
      const item = this.assetCategoryOptions.find(r => r.id === id)
      if (item) { this.form.assetCategoryName = item.categoryName }
    },
    onMeasuringCategoryChange(id) {
      const item = this.measuringCategoryOptions.find(r => r.id === id)
      if (item) {
        this.form.measuringCategoryName = item.categoryName
        this.form.calibrationCycleDays = item.calibrationCycleDays
      }
    },
    getList() {
      this.loading = true
      listAssetLedger(this.queryParams).then(res => {
        this.dataList = res.rows || []
        this.total = res.total || 0
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    cancel() { this.open = false; this.activeTab = 'basic'; this.reset() },
    reset() {
      this.form = {
        id: null, equipmentSerialNo: null, category68Id: null, category68Code: null, category68ArchiveNo: null,
        name: null, namePinyin: null, spec: null, model: null, registerCertNo: null,
        brandId: null, brandName: null, manufacturerId: null, manufacturerName: null, supplierId: null, supplierName: null,
        serialNumber: null, unit: null, originalValue: null, netValue: null, deptId: null, deptName: null, storagePlace: null,
        acceptanceDate: null, storageDate: null, manufactureDate: null, scrapDate: null, expectedScrapDate: null,
        assetCategoryId: null, assetCategoryName: null, measuringCategoryId: null, measuringCategoryName: null, calibrationCycleDays: null,
        lastCalibrationDate: null, nextCalibrationDate: null, useStatus: null, useStatusName: null, labelPrintStatus: null, labelPrintTime: null,
        repairStatus: null, repairStatusName: null, warrantyDays: null, warrantyStartTime: null, warrantyEndTime: null, warrantyType: null
      }
      this.resetForm('form')
    },
    handleAdd() { this.reset(); this.open = true; this.title = '新增客户资产台账' },
    handleUpdate(row) {
      this.reset()
      const id = (row && row.id) || this.ids[0]
      getAssetLedger(id).then(res => {
        this.form = res.data || {}
        this.open = true
        this.title = '修改客户资产台账'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.id) {
          updateAssetLedger(this.form).then(() => { this.$modal.msgSuccess('修改成功'); this.open = false; this.getList() })
        } else {
          addAssetLedger(this.form).then(() => { this.$modal.msgSuccess('新增成功'); this.open = false; this.getList() })
        }
      })
    },
    handleDelete(row) {
      const id = (row && row.id) || this.ids[0]
      this.$modal.confirm('是否确认删除该资产台账？').then(() => delAssetLedger(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前查询条件下的资产台账？').then(() => {
        this.download('equipment/assetLedger/export', { ...this.queryParams }, `asset_ledger_${new Date().getTime()}.xlsx`)
      }).catch(() => {})
    },
    handleSelectionChange(selection) { this.ids = selection.map(r => r.id); this.single = selection.length !== 1 },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() }
  }
}
</script>

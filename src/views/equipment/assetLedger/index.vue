<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="名称/简码" prop="name">
        <el-input v-model="queryParams.name" placeholder="名称或拼音简码模糊" clearable style="width:160px" />
      </el-form-item>
      <el-form-item label="设备流水号" prop="equipmentSerialNo">
        <el-input v-model="queryParams.equipmentSerialNo" placeholder="模糊匹配" clearable style="width:120px" />
      </el-form-item>
      <el-form-item label="68档案号" prop="category68ArchiveNo">
        <el-input v-model="queryParams.category68ArchiveNo" placeholder="模糊匹配" clearable style="width:120px" />
      </el-form-item>
      <el-form-item label="规格" prop="spec">
        <el-input v-model="queryParams.spec" placeholder="模糊匹配" clearable style="width:120px" />
      </el-form-item>
      <el-form-item label="型号" prop="model">
        <el-input v-model="queryParams.model" placeholder="模糊匹配" clearable style="width:120px" />
      </el-form-item>
      <el-form-item label="品牌" prop="brandKeyword">
        <el-input v-model="queryParams.brandKeyword" placeholder="名称/拼音简码模糊" clearable style="width:160px" />
      </el-form-item>
      <el-form-item label="生产厂家" prop="manufacturerKeyword">
        <el-input v-model="queryParams.manufacturerKeyword" placeholder="名称/拼音简码模糊" clearable style="width:160px" />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierKeyword">
        <el-input v-model="queryParams.supplierKeyword" placeholder="名称/拼音简码模糊" clearable style="width:160px" />
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
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-upload2" size="small" @click="handleImport" v-hasPermi="['equipment:assetLedger:import']">导入</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" height="calc(100vh - 280px)">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备流水号" align="center" prop="equipmentSerialNo" width="100" show-overflow-tooltip />
      <el-table-column label="财务系统唯一标识" align="center" prop="financialSystemUniqueId" width="120" show-overflow-tooltip />
      <el-table-column label="HIS系统唯一标识" align="center" prop="hisSystemUniqueId" width="120" show-overflow-tooltip />
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
                <el-form-item label="68分类" prop="category68Id">
                  <treeselect
                    v-model="form.category68Id"
                    :options="category68OptionsTree"
                    :normalizer="normalizerCategory68"
                    placeholder="请选择（按层级显示）"
                    clearable
                    style="width:100%"
                    @input="onCategory68Change"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备流水号" prop="equipmentSerialNo">
                  <el-input v-model="form.equipmentSerialNo" placeholder="系统自动生成" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="财务系统唯一标识" prop="financialSystemUniqueId">
                  <el-input v-model="form.financialSystemUniqueId" placeholder="与第三方财务系统对接" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="HIS系统唯一标识" prop="hisSystemUniqueId">
                  <el-input v-model="form.hisSystemUniqueId" placeholder="与第三方HIS系统对接" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入，拼音简码将自动生成" @input="onNameInput" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="名称拼音简码" prop="namePinyin">
                  <el-input v-model="form.namePinyin" placeholder="根据名称自动生成" disabled />
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
                  <el-select v-model="form.manufacturerId" placeholder="请选择或输入新厂家名称" clearable filterable allow-create style="width:100%" @change="onManufacturerChange" @blur="onManufacturerBlur">
                    <el-option v-for="item in manufacturerOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="供应商" prop="supplierId">
                  <el-select v-model="form.supplierId" placeholder="请选择或输入新供应商名称" clearable filterable allow-create style="width:100%" @change="onSupplierChange" @blur="onSupplierBlur">
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
                <el-form-item label="所属科室" prop="deptId">
                  <el-select v-model="form.deptId" placeholder="请选择（必填，仅限客户科室列表）" clearable filterable style="width:100%" @change="onDeptChange">
                    <el-option v-for="item in deptOptions" :key="item.id" :label="item.name" :value="String(item.id)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属科室名称" prop="deptName">
                  <el-input v-model="form.deptName" placeholder="选择科室后自动填充" disabled />
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

    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <span>仅允许导入 xls、xlsx 格式。填写「设备流水号」则按流水号更新已有台账（须与系统内台账匹配，否则该行不导入）；不填则为新增。所属科室必填且须在客户科室列表中；生产厂家、供应商可填名称，匹配不到将自动新增。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAssetLedger, getAssetLedger, addAssetLedger, updateAssetLedger, delAssetLedger } from '@/api/equipment/assetLedger'
import { treeselectCustomerCategory68 } from '@/api/foundation/customerCategory68'
import { listdepartAll } from '@/api/foundation/depart'
import { listBrand } from '@/api/equipment/brand'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { pinyin } from 'pinyin-pro'
import { listManufacturer, getOrCreateManufacturer } from '@/api/equipment/manufacturer'
import { listSupplier, getOrCreateSupplier } from '@/api/equipment/supplier'
import { listAssetCategory } from '@/api/equipment/assetCategory'
import { listMeasuringCategory } from '@/api/equipment/measuringCategory'
import { getToken } from '@/utils/auth'

export default {
  name: 'CustomerAssetLedger',
  components: { Treeselect },
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
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        equipmentSerialNo: null,
        category68ArchiveNo: null,
        spec: null,
        model: null,
        brandKeyword: null,
        manufacturerKeyword: null,
        supplierKeyword: null
      },
      form: {},
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        deptId: [{ required: true, message: '所属科室不能为空', trigger: 'change' }]
      },
      category68OptionsTree: [],
      category68Map: {},
      deptOptions: [],
      brandOptions: [],
      manufacturerOptions: [],
      supplierOptions: [],
      assetCategoryOptions: [],
      measuringCategoryOptions: [],
      upload: {
        open: false,
        title: '资产台账导入',
        isUploading: false,
        url: process.env.VUE_APP_BASE_API + '/equipment/assetLedger/importData',
        headers: { Authorization: 'Bearer ' + getToken() }
      }
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  methods: {
    loadOptions() {
      treeselectCustomerCategory68().then(res => {
        const list = res.data || []
        this.category68OptionsTree = this.normalizeCategory68Tree(list)
        this.category68Map = {}
        this.buildCategory68Map(list)
      }).catch(() => { this.category68OptionsTree = []; this.category68Map = {} })
      const userId = this.$store.getters.userId || this.$store.state.user?.userId
      if (userId) {
        listdepartAll(userId).then(res => {
          this.deptOptions = res.data || res || []
        }).catch(() => { this.deptOptions = [] })
      } else {
        this.deptOptions = []
      }
      listBrand({ pageNum: 1, pageSize: 500 }).then(res => { this.brandOptions = res.rows || [] })
      listManufacturer({ pageNum: 1, pageSize: 500 }).then(res => { this.manufacturerOptions = res.rows || [] })
      listSupplier({ pageNum: 1, pageSize: 500 }).then(res => { this.supplierOptions = res.rows || [] })
      listAssetCategory({ pageNum: 1, pageSize: 500 }).then(res => { this.assetCategoryOptions = res.rows || [] })
      listMeasuringCategory({ pageNum: 1, pageSize: 500 }).then(res => { this.measuringCategoryOptions = res.rows || [] })
    },
    normalizeCategory68Tree(nodes) {
      if (!nodes || !nodes.length) return []
      return nodes.map(n => {
        const codeName = (n.category68Code || '') + ' ' + (n.category68Name || '')
        const pinyin = (n.namePinyin || '').trim()
        const label = pinyin ? codeName + ' ' + pinyin : codeName
        return {
          id: n.id,
          label: label,
          children: n.children && n.children.length ? this.normalizeCategory68Tree(n.children) : undefined
        }
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
    onCategory68Change(id) {
      if (!id) { this.form.category68Code = null; return }
      const node = this.category68Map[id]
      this.form.category68Code = node ? node.category68Code : null
    },
    onNameInput() {
      this.form.namePinyin = this.getPinyinInitials(this.form.name)
    },
    getPinyinInitials(val) {
      if (!val || !String(val).trim()) return ''
      return pinyin(String(val).trim(), { pattern: 'first', toneType: 'none', type: 'array' }).join('').toUpperCase()
    },
    onDeptChange(deptId) {
      const item = this.deptOptions.find(d => String(d.id) === String(deptId))
      this.form.deptName = item ? item.name : ''
    },
    onBrandChange(id) {
      const item = this.brandOptions.find(r => r.id === id)
      if (item) { this.form.brandName = item.name }
    },
    onManufacturerChange(id) {
      if (!id) { this.form.manufacturerName = null; return }
      const item = this.manufacturerOptions.find(r => r.id === id)
      if (item) { this.form.manufacturerName = item.name }
    },
    onManufacturerBlur() {
      const val = this.form.manufacturerId
      if (!val || this.manufacturerOptions.some(r => r.id === val)) return
      const name = typeof val === 'string' ? val.trim() : ''
      if (!name) return
      getOrCreateManufacturer(name).then(res => {
        const m = res.data
        if (m && m.id) {
          if (!this.manufacturerOptions.some(r => r.id === m.id)) this.manufacturerOptions.push({ id: m.id, name: m.name })
          this.form.manufacturerId = m.id
          this.form.manufacturerName = m.name
        }
      }).catch(() => {})
    },
    onSupplierChange(id) {
      if (!id) { this.form.supplierName = null; return }
      const item = this.supplierOptions.find(r => r.id === id)
      if (item) { this.form.supplierName = item.name }
    },
    onSupplierBlur() {
      const val = this.form.supplierId
      if (!val || this.supplierOptions.some(r => r.id === val)) return
      const name = typeof val === 'string' ? val.trim() : ''
      if (!name) return
      getOrCreateSupplier(name).then(res => {
        const s = res.data
        if (s && s.id) {
          if (!this.supplierOptions.some(r => r.id === s.id)) this.supplierOptions.push({ id: s.id, name: s.name })
          this.form.supplierId = s.id
          this.form.supplierName = s.name
        }
      }).catch(() => {})
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
        id: null, equipmentSerialNo: null, financialSystemUniqueId: null, hisSystemUniqueId: null, category68Id: null, category68Code: null, category68ArchiveNo: null,
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
    handleAdd() { this.reset(); this.open = true; this.title = '新增资产台账' },
    handleUpdate(row) {
      this.reset()
      const id = (row && row.id) || this.ids[0]
      getAssetLedger(id).then(res => {
        this.form = res.data || {}
        this.open = true
        this.title = '修改资产台账'
      })
    },
    async submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        await this.ensureManufacturerAndSupplier()
        if (this.form.id) {
          updateAssetLedger(this.form).then(() => { this.$modal.msgSuccess('修改成功'); this.open = false; this.getList() })
        } else {
          addAssetLedger(this.form).then(() => { this.$modal.msgSuccess('新增成功'); this.open = false; this.getList() })
        }
      })
    },
    async ensureManufacturerAndSupplier() {
      const mid = this.form.manufacturerId
      if (mid && !this.manufacturerOptions.some(r => r.id === mid)) {
        const name = typeof mid === 'string' ? mid.trim() : ''
        if (name) {
          try {
            const res = await getOrCreateManufacturer(name)
            const m = res.data
            if (m && m.id) {
              if (!this.manufacturerOptions.some(r => r.id === m.id)) this.manufacturerOptions.push({ id: m.id, name: m.name })
              this.form.manufacturerId = m.id
              this.form.manufacturerName = m.name
            }
          } catch (e) { /* ignore */ }
        }
      }
      const sid = this.form.supplierId
      if (sid && !this.supplierOptions.some(r => r.id === sid)) {
        const name = typeof sid === 'string' ? sid.trim() : ''
        if (name) {
          try {
            const res = await getOrCreateSupplier(name)
            const s = res.data
            if (s && s.id) {
              if (!this.supplierOptions.some(r => r.id === s.id)) this.supplierOptions.push({ id: s.id, name: s.name })
              this.form.supplierId = s.id
              this.form.supplierName = s.name
            }
          } catch (e) { /* ignore */ }
        }
      }
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
    handleImport() {
      this.upload.title = '资产台账导入'
      this.upload.open = true
    },
    importTemplate() {
      this.download('equipment/assetLedger/importTemplate', {}, `资产台账导入模板_${new Date().getTime()}.xlsx`)
    },
    handleFileUploadProgress() {
      this.upload.isUploading = true
    },
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.$alert('<div style="overflow:auto;overflow-x:hidden;max-height:70vh;padding:10px 20px 0;">' + (response.msg || response.message || '导入完成') + '</div>', '导入结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },
    submitFileForm() {
      this.$refs.upload && this.$refs.upload.submit()
    },
    handleSelectionChange(selection) { this.ids = selection.map(r => r.id); this.single = selection.length !== 1 },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() }
  }
}
</script>

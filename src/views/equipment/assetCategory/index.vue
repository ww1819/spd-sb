<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="分类名称/简码" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="名称或拼音简码模糊搜索" clearable @keyup.enter.native="handleQuery" style="width:200px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd" v-hasPermi="['equipment:assetCategory:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="small" :disabled="single" @click="handleUpdate" v-hasPermi="['equipment:assetCategory:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="small" :disabled="single" @click="handleDelete" v-hasPermi="['equipment:assetCategory:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" height="calc(100vh - 280px)">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="资产分类编码" align="center" prop="categoryCode" width="120" show-overflow-tooltip />
      <el-table-column label="资产分类名称" align="center" prop="categoryName" min-width="140" show-overflow-tooltip />
      <el-table-column label="资产分类拼音简码" align="center" prop="categoryPinyin" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['equipment:assetCategory:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['equipment:assetCategory:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="资产分类编码" prop="categoryCode">
          <el-input v-model="form.categoryCode" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="资产分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入" @input="updateCategoryPinyin" />
        </el-form-item>
        <el-form-item label="资产分类拼音简码" prop="categoryPinyin">
          <el-input v-model="form.categoryPinyin" placeholder="根据名称自动生成，可编辑" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pinyin } from 'pinyin-pro'
import { listAssetCategory, getAssetCategory, addAssetCategory, updateAssetCategory, delAssetCategory } from '@/api/equipment/assetCategory'

export default {
  name: 'AssetCategory',
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
      queryParams: { pageNum: 1, pageSize: 10, categoryName: null },
      form: {},
      rules: { categoryName: [{ required: true, message: '资产分类名称不能为空', trigger: 'blur' }] }
    }
  },
  created() { this.getList() },
  methods: {
    getList() {
      this.loading = true
      listAssetCategory(this.queryParams).then(res => {
        this.dataList = res.rows || []
        this.total = res.total || 0
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    cancel() { this.open = false; this.reset() },
    reset() { this.form = { id: null, categoryCode: null, categoryName: null, categoryPinyin: null }; this.resetForm('form') },
    handleAdd() { this.reset(); this.open = true; this.title = '新增资产分类' },
    handleUpdate(row) {
      this.reset()
      const id = (row && row.id) || this.ids[0]
      getAssetCategory(id).then(res => { this.form = res.data || {}; this.open = true; this.title = '修改资产分类' })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.id) {
          updateAssetCategory(this.form).then(() => { this.$modal.msgSuccess('修改成功'); this.open = false; this.getList() })
        } else {
          addAssetCategory(this.form).then(() => { this.$modal.msgSuccess('新增成功'); this.open = false; this.getList() })
        }
      })
    },
    handleDelete(row) {
      const id = (row && row.id) || this.ids[0]
      this.$modal.confirm('是否确认删除该资产分类？').then(() => delAssetCategory(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {})
    },
    handleSelectionChange(selection) { this.ids = selection.map(r => r.id); this.single = selection.length !== 1 },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    getPinyinInitials(val) {
      if (!val || !String(val).trim()) return ''
      return pinyin(String(val).trim(), { pattern: 'first', toneType: 'none', type: 'array' }).join('').toUpperCase()
    },
    updateCategoryPinyin() {
      this.form.categoryPinyin = this.getPinyinInitials(this.form.categoryName)
    }
  }
}
</script>

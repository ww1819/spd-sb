<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="tree-card">
          <el-tree
            :data="treeData"
            :props="treeProps"
            node-key="id"
            highlight-current
            @node-click="handleNodeClick"
            default-expand-all
          >
            <span slot-scope="{ node }" class="custom-tree-node">
              <i class="el-icon-folder-opened" />
              <span>{{ node.label }}</span>
            </span>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
          <el-form-item label="分类代码" prop="category68Code">
            <el-input v-model="queryParams.category68Code" placeholder="请输入" clearable @keyup.enter.native="handleQuery" style="width:160px" />
          </el-form-item>
          <el-form-item label="分类名称" prop="category68Name">
            <el-input v-model="queryParams.category68Name" placeholder="请输入" clearable @keyup.enter.native="handleQuery" style="width:160px" />
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-refresh" size="small" @click="handleSync" v-hasPermi="['foundation:customerCategory68:sync']">同步</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="el-icon-edit" size="small" :disabled="single" @click="handleUpdate" v-hasPermi="['foundation:customerCategory68:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="small" :disabled="single" @click="handleDelete" v-hasPermi="['foundation:customerCategory68:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-document" size="small" @click="handleLog" v-hasPermi="['foundation:customerCategory68:log']">操作记录</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" height="calc(100vh - 330px)">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="分类代码" align="center" prop="category68Code" width="140" show-overflow-tooltip />
          <el-table-column label="分类名称" align="center" prop="category68Name" min-width="200" show-overflow-tooltip />
          <el-table-column label="对应标准ID" align="center" prop="refCategory68Id" width="100" />
          <el-table-column label="更新时间" align="center" prop="updateTime" width="160">
            <template slot-scope="scope">{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['foundation:customerCategory68:edit']">修改</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['foundation:customerCategory68:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类代码" prop="category68Code">
          <el-input v-model="form.category68Code" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="分类名称" prop="category68Name">
          <el-input v-model="form.category68Name" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 操作记录 -->
    <el-dialog title="医疗器械68分类操作记录" :visible.sync="openLog" width="800px" append-to-body>
      <el-table :data="logList" border size="small" max-height="400">
        <el-table-column label="操作类型" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.operationType === 'add'" type="success" size="small">新增</el-tag>
            <el-tag v-else-if="scope.row.operationType === 'update'" type="primary" size="small">修改</el-tag>
            <el-tag v-else-if="scope.row.operationType === 'delete'" type="danger" size="small">删除</el-tag>
            <span v-else>{{ scope.row.operationType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" prop="operateTime" width="160" />
        <el-table-column label="操作人" prop="operateBy" width="100" />
        <el-table-column label="变更前" prop="contentOld" min-width="120" show-overflow-tooltip />
        <el-table-column label="变更后" prop="contentNew" min-width="120" show-overflow-tooltip />
      </el-table>
      <div slot="footer">
        <el-button @click="openLog = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCustomerCategory68,
  treeselectCustomerCategory68,
  getCustomerCategory68,
  updateCustomerCategory68,
  delCustomerCategory68,
  syncCustomerCategory68,
  getCustomerCategory68Log
} from '@/api/foundation/customerCategory68'

export default {
  name: 'CustomerCategory68',
  data() {
    return {
      treeData: [],
      treeProps: { label: 'category68Name', children: 'children' },
      loading: true,
      ids: [],
      single: true,
      showSearch: true,
      total: 0,
      dataList: [],
      title: '',
      open: false,
      openLog: false,
      logList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        category68Code: null,
        category68Name: null
      },
      form: {},
      rules: {
        category68Code: [{ required: true, message: '分类代码不能为空', trigger: 'blur' }],
        category68Name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listCustomerCategory68(this.queryParams).then(res => {
        this.dataList = res.rows || []
        this.total = res.total || 0
        this.loading = false
      }).catch(() => { this.loading = false })
      treeselectCustomerCategory68().then(res => {
        const list = res.data || []
        // 后端已返回树形结构（含 children），直接作为根节点的子节点，无需前端再 buildTree
        this.treeData = [{
          id: 'root',
          category68Name: '全部68分类',
          children: list
        }]
      })
    },
    handleNodeClick(data) {
      if (data.id === 'root') {
        delete this.queryParams.refCategory68Id
      } else {
        this.queryParams.refCategory68Id = data.refCategory68Id
      }
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleSync() {
      this.$modal.confirm('是否以标准68分类为蓝本同步？将更新已有数据并新增缺失项。').then(() => {
        return syncCustomerCategory68()
      }).then(() => {
        this.$modal.msgSuccess('同步成功')
        this.getList()
      }).catch(() => {})
    },
    handleUpdate(row) {
      this.reset()
      const id = (row && row.id) || this.ids[0]
      getCustomerCategory68(id).then(res => {
        this.form = res.data || {}
        this.open = true
        this.title = '修改医疗器械68分类'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        updateCustomerCategory68(this.form).then(() => {
          this.$modal.msgSuccess('修改成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const id = (row && row.id) || this.ids[0]
      const name = (row && row.category68Name) || id
      this.$modal.confirm('是否确认删除医疗器械68分类“' + name + '”？').then(() => {
        return delCustomerCategory68(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleLog() {
      this.logList = []
      this.openLog = true
      getCustomerCategory68Log().then(res => {
        this.logList = res.data || []
      })
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(r => r.id)
      this.single = selection.length !== 1
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      delete this.queryParams.refCategory68Id
      this.handleQuery()
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = { id: null, category68Code: null, category68Name: null }
      this.resetForm('form')
    }
  }
}
</script>

<style scoped>
.tree-card {
  margin-right: 15px;
  height: calc(100vh - 180px);
  overflow-y: auto;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 3px 0;
}
.el-tree { background: transparent; padding: 10px; }
</style>

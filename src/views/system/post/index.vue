<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工作组编码" prop="postCode">
        <el-input
          v-model="queryParams.postCode"
          placeholder="请输入工作组编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工作组名称" prop="postName">
        <el-input
          v-model="queryParams.postName"
          placeholder="请输入工作组名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="工作组状态" clearable>
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
          v-hasPermi="['system:post:add', 'system:post:list', 'sb:system:workgroup:add']"
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
          v-hasPermi="['system:post:edit', 'system:post:list', 'sb:system:workgroup:edit']"
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
          v-hasPermi="['system:post:remove', 'system:post:list', 'sb:system:workgroup:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="small"
          @click="handleExport"
          v-hasPermi="['system:post:export', 'system:post:list', 'sb:system:workgroup:query']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-refresh"
          size="small"
          @click="handleSyncWarehouse"
          v-hasPermi="['system:post:sync', 'system:post:list', 'sb:system:workgroup:edit']"
        >同步仓库</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-refresh"
          size="small"
          @click="handleSyncDepartment"
          v-hasPermi="['system:post:sync', 'system:post:list', 'sb:system:workgroup:edit']"
        >同步科室</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-refresh"
          size="small"
          @click="handleSyncMenu"
          v-hasPermi="['system:post:sync', 'system:post:list', 'sb:system:workgroup:edit']"
        >同步菜单</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" align="center" width="80" :index="indexMethod" />
      <el-table-column label="编码" align="center" prop="postCode" />
      <el-table-column label="工作组名称" align="center" prop="postName" />
      <el-table-column label="工作组排序" align="center" prop="postSort" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:post:edit', 'system:post:list', 'sb:system:workgroup:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:post:remove', 'system:post:list', 'sb:system:workgroup:remove']"
          >删除</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-s-check"
            @click="handleAuth(scope.row)"
            v-hasPermi="['system:post:edit', 'system:post:list', 'sb:system:workgroup:edit']"
          >授权</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改工作组对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="工作组名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入工作组名称" />
        </el-form-item>
        <el-form-item label="工作组编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="工作组排序" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="工作组状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 授权弹窗 -->
    <el-dialog :title="authTitle || '授权'" :visible.sync="authOpen" width="720px" append-to-body>
    <el-tabs type="card">
      <el-tab-pane label="菜单权限">
        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 8px; font-size: 12px;">
          勾选菜单及按钮权限；展开节点可看到各菜单下的【按钮】权限（如新增、修改、删除）。
        </el-alert>
        <div style="margin-bottom: 8px;">
          <el-button size="mini" @click="handleAuthMenuAll(true)">全选</el-button>
          <el-button size="mini" @click="handleAuthMenuAll(false)">取消</el-button>
        </div>
        <el-tree
          ref="authMenuTree"
          :data="menuOptions"
          :props="defaultProps"
          node-key="id"
          show-checkbox
          :check-strictly="false"
          :default-expand-all="true"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          @check="handleAuthMenuCheck"
          style="max-height: 300px; overflow-y: auto;"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span v-if="data.menuType === 'F'" class="tree-node-btn">【按钮】</span>
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-tab-pane>
      <el-tab-pane label="科室权限">
        <div style="margin-bottom: 8px;">
          <el-button size="mini" @click="handleAuthDepartmentAll(true)">全选</el-button>
          <el-button size="mini" @click="handleAuthDepartmentAll(false)">取消</el-button>
          <el-input
            v-model="departmentKeyword"
            size="mini"
            clearable
            placeholder="搜索科室"
            style="width: 180px; margin-left: 10px;"
          />
        </div>
        <div class="auth-checkbox-container">
          <el-checkbox-group v-model="authForm.departmentIds" class="auth-checkbox-group">
            <el-checkbox v-for="item in filteredDepartmentOptions"
                         :key="item.id"
                         :label="item.id"
                         class="auth-checkbox-item">{{item.name}}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-tab-pane>
      <el-tab-pane label="仓库权限">
        <div style="margin-bottom: 8px;">
          <el-button size="mini" @click="handleAuthWarehouseAll(true)">全选</el-button>
          <el-button size="mini" @click="handleAuthWarehouseAll(false)">取消</el-button>
        </div>
        <div style="max-height: 300px; overflow-y: auto;">
          <el-checkbox-group v-model="authForm.warehouseIds">
            <el-checkbox v-for="item in userWarehouseOptions"
                         :key="item.id"
                         :label="item.id">{{item.name}}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-tab-pane>
      <el-tab-pane label="单位权限">
        <div style="max-height: 300px; overflow-y: auto;">
          <div style="color:#909399; padding: 20px; text-align: center;">暂无数据</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="用户">
        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 8px; font-size: 12px;">
          勾选表示该用户属于本工作组；仅显示当前组织机构下用户。
        </el-alert>
        <div style="max-height: 320px; overflow-y: auto;">
          <el-table :data="authUserList" size="small" max-height="300">
            <el-table-column label="用户账号" prop="userName" min-width="100" />
            <el-table-column label="用户姓名" prop="nickName" min-width="100" />
            <el-table-column label="在本组" align="center" width="80">
              <template slot-scope="scope">
                <el-checkbox
                  :value="authForm.userIdsInGroup.indexOf(scope.row.userId) !== -1"
                  @change="(val) => toggleAuthUserInGroup(scope.row.userId, val)"
                />
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!authUserList || authUserList.length === 0" style="color:#909399; padding: 20px; text-align: center;">暂无租户用户</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="待办事项">
        <div style="max-height: 300px; overflow-y: auto;">
          <div style="color:#909399; padding: 20px; text-align: center;">暂无数据</div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitAuth">保 存</el-button>
      <el-button @click="authOpen = false">取 消</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listWorkGroup,
  getWorkGroup,
  delWorkGroup,
  addWorkGroup,
  updateWorkGroup,
  getWorkGroupMenuIds,
  getWorkGroupWarehouseIds,
  getWorkGroupDeptIds,
  getWorkGroupMenuTree,
  saveWorkGroupMenus,
  saveWorkGroupWarehouses,
  saveWorkGroupDepts,
  syncWorkGroupToUsers,
  listUserIdsByGroupId,
  addWorkGroupUsers,
  removeWorkGroupUser
} from "@/api/system/workgroup";
import { treeselect as menuTreeselect } from "@/api/system/menu";
import { listUserAll, getUser, updateUser } from "@/api/system/user";
import { getOptionselect as getWarehouseOptionselect } from "@/api/foundation/warehouse";
import { listdepartAll } from "@/api/foundation/depart";
import { getToken } from "@/utils/auth";

export default {
  name: "Post",
  dicts: ['sys_normal_disable'],
  computed: {
    /** 当前租户客户ID（设备系统岗位列表取设备系统工作组表） */
    customerId() {
      const tenant = this.$store.state.user.tenant;
      return (tenant && tenant.customerId) ? tenant.customerId : "";
    },
    filteredDepartmentOptions() {
      const keyword = (this.departmentKeyword || "").trim();
      if (!keyword) return this.userDepartmentOptions || [];
      return (this.userDepartmentOptions || []).filter(item =>
        (item.name || "").includes(keyword)
      );
    },
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 工作组表格数据（全部与筛选后）
      postListAll: [],
      postList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        postCode: undefined,
        postName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 授权弹窗
      authOpen: false,
      authTitle: "",
      authForm: {
        postId: null,
        menuIds: [],
        departmentIds: [],
        warehouseIds: []
      },
      // 保存的工作组权限（用于同步）
      savedPostPermissions: {},
      authMenuCheckAll: false,
      authMenuIndeterminate: false,
      // 菜单选项
      menuOptions: [],
      // 仓库选项
      userWarehouseOptions: [],
      // 科室选项
      userDepartmentOptions: [],
      // 科室搜索关键字
      departmentKeyword: "",
      // 授权弹窗 - 租户下所有用户列表（用户 tab）
      authUserList: [],
      // 授权弹窗打开时工作组已有用户ID（用于提交时计算增删）
      authInitialGroupUserIds: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        postName: [
          { required: true, message: "工作组名称不能为空", trigger: "blur" }
        ],
        postCode: [
          { required: true, message: "工作组编码不能为空", trigger: "blur" }
        ],
        postSort: [
          { required: true, message: "工作组排序不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询工作组列表（设备系统取 sb_work_group 表） */
    getList() {
      if (!this.customerId) {
        this.postListAll = [];
        this.postList = [];
        this.total = 0;
        this.loading = false;
        return;
      }
      this.loading = true;
      listWorkGroup(this.customerId).then(res => {
        const raw = res.data || res || [];
        this.postListAll = raw.map(g => ({
          postId: g.groupId,
          postCode: g.groupKey || "",
          postName: g.groupName || "",
          postSort: g.orderNum != null ? g.orderNum : 0,
          status: "0",
          createTime: g.createTime
        }));
        this.applyListFilter();
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    /** 按查询条件筛选列表（编码、名称） */
    applyListFilter() {
      let list = this.postListAll || [];
      const code = (this.queryParams.postCode || "").trim();
      const name = (this.queryParams.postName || "").trim();
      if (code) list = list.filter(i => (i.postCode || "").indexOf(code) !== -1);
      if (name) list = list.filter(i => (i.postName || "").indexOf(name) !== -1);
      this.postList = list;
      this.total = list.length;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        postId: undefined,
        groupId: undefined,
        customerId: this.customerId,
        postCode: undefined,
        postName: undefined,
        postSort: 0,
        status: "0",
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      if (this.postListAll && this.postListAll.length > 0) {
        this.applyListFilter();
      } else {
        this.getList();
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    // 序号计算方法
    indexMethod(index) {
      return (this.queryParams.pageNum - 1) * this.queryParams.pageSize + index + 1;
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.postId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.form.customerId = this.customerId;
      this.open = true;
      this.title = "添加工作组";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const groupId = (row && (row.postId || row.groupId)) || (this.ids && this.ids[0]);
      getWorkGroup(groupId).then(res => {
        const g = res.data || res;
        this.form = {
          postId: g.groupId,
          groupId: g.groupId,
          customerId: g.customerId,
          postCode: g.groupKey || "",
          postName: g.groupName || "",
          postSort: g.orderNum != null ? g.orderNum : 0,
          status: "0",
          remark: g.remark
        };
        this.open = true;
        this.title = "修改工作组";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.groupId) {
            updateWorkGroup({
              groupId: this.form.groupId,
              groupName: this.form.postName,
              groupKey: this.form.postCode,
              orderNum: this.form.postSort
            }).then(() => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addWorkGroup({
              customerId: this.form.customerId || this.customerId,
              groupName: this.form.postName,
              groupKey: this.form.postCode,
              orderNum: this.form.postSort
            }).then(() => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row && row.postId ? [row.postId] : (this.ids || []);
      if (!ids.length) return;
      this.$modal.confirm('是否确认删除所选工作组？').then(() => {
        return Promise.all(ids.map(id => delWorkGroup(id)));
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(error => {
        const errorMsg = error?.msg || error?.message || "删除失败";
        this.$modal.msgError(errorMsg);
      });
    },
    /** 导出按钮操作（设备系统工作组无后端导出，导出当前列表） */
    handleExport() {
      if (!this.postList.length) {
        this.$modal.msgWarning("暂无数据可导出");
        return;
      }
      this.download('system/post/export', { ...this.queryParams }, `workgroup_${new Date().getTime()}.xlsx`);
    },
    /** 同步菜单：仅将当前工作组的菜单权限同步到组内所有用户 */
    handleSyncMenu() {
      if (this.single || !this.ids || this.ids.length === 0) {
        this.$modal.msgWarning("请先选择一个工作组");
        return;
      }
      const groupId = this.ids[0];
      this.$modal.confirm("是否确认将该工作组的【菜单权限】同步到组内所有用户？").then(() => {
        return getWorkGroupMenuIds(groupId);
      }).then(res => {
        const menuIds = res.data || res || [];
        return this.syncMenuToUsers(groupId, Array.isArray(menuIds) ? menuIds : []);
      }).catch(e => {
        if (e !== "cancel") this.$modal.msgError(e?.msg || e?.message || "同步菜单权限失败");
      });
    },
    /** 同步仓库：仅将当前工作组的仓库权限同步到组内所有用户 */
    handleSyncWarehouse() {
      if (this.single || !this.ids || this.ids.length === 0) {
        this.$modal.msgWarning("请先选择一个工作组");
        return;
      }
      const groupId = this.ids[0];
      this.$modal.confirm("是否确认将该工作组的【仓库权限】同步到组内所有用户？").then(() => {
        return getWorkGroupWarehouseIds(groupId);
      }).then(res => {
        const warehouseIds = res.data || res || [];
        const ids = Array.isArray(warehouseIds) ? warehouseIds.map(Number).filter(n => !isNaN(n)) : [];
        return this.syncWarehouseToUsers(groupId, ids);
      }).catch(e => {
        if (e !== "cancel") this.$modal.msgError(e?.msg || e?.message || "同步仓库权限失败");
      });
    },
    /** 同步科室：仅将当前工作组的科室权限同步到组内所有用户 */
    handleSyncDepartment() {
      if (this.single || !this.ids || this.ids.length === 0) {
        this.$modal.msgWarning("请先选择一个工作组");
        return;
      }
      const groupId = this.ids[0];
      this.$modal.confirm("是否确认将该工作组的【科室权限】同步到组内所有用户？").then(() => {
        return getWorkGroupDeptIds(groupId);
      }).then(res => {
        const departmentIds = res.data || res || [];
        const ids = Array.isArray(departmentIds) ? departmentIds.map(Number).filter(n => !isNaN(n)) : [];
        return this.syncDepartmentToUsers(groupId, ids);
      }).catch(e => {
        if (e !== "cancel") this.$modal.msgError(e?.msg || e?.message || "同步科室权限失败");
      });
    },
    /** 获取工作组下的所有用户（从 sb_work_group_user 接口取组内用户ID，再拉取详情供同步权限用） */
    getUsersByPostId(postId) {
      return listUserIdsByGroupId(postId).then(res => {
        const userIds = res.data || res || [];
        const idList = Array.isArray(userIds) ? userIds.map(Number).filter(id => !isNaN(id)) : [];
        if (idList.length === 0) return Promise.resolve([]);
        return Promise.all(idList.map(uid => getUser(uid))).then(userResponses => {
          return userResponses.filter(r => r != null);
        });
      });
    },
    /** 将菜单权限同步到工作组下的所有用户，返回 Promise */
    syncMenuToUsers(postId, menuIds) {
      return this.getUsersByPostId(postId).then(users => {
        if (!users || users.length === 0) {
          this.$modal.msgWarning("该工作组下没有用户");
          return 0;
        }
        const updatePromises = users.map(userResponse => {
          const userData = userResponse.data;
          const payload = {
            ...userData,
            userId: userData.userId,
            menuIds: menuIds,
            workGroupIds: userResponse.workGroupIds || [],
            departmentIds: userResponse.departmentIds || [],
            warehouseIds: userResponse.warehouseIds || []
          };
          return updateUser(payload);
        });
        return Promise.all(updatePromises).then(() => users.length);
      }).then(userCount => {
        if (userCount > 0) {
          this.$modal.msgSuccess(`成功同步菜单权限到 ${userCount} 个用户`);
          this.getList();
        }
        return userCount;
      }).catch(error => {
        console.error('同步菜单权限失败:', error);
        this.$modal.msgError("同步菜单权限失败：" + (error.msg || error.message || '未知错误'));
        throw error;
      });
    },
    /** 将仓库权限同步到工作组下的所有用户，返回 Promise */
    syncWarehouseToUsers(postId, warehouseIds) {
      return this.getUsersByPostId(postId).then(users => {
        if (!users || users.length === 0) {
          this.$modal.msgWarning("该工作组下没有用户");
          return 0;
        }
        const updatePromises = users.map(userResponse => {
          const userData = userResponse.data;
          const payload = {
            ...userData,
            userId: userData.userId,
            warehouseIds: warehouseIds,
            workGroupIds: userResponse.workGroupIds || [],
            menuIds: userResponse.menuIds || [],
            departmentIds: userResponse.departmentIds || []
          };
          return updateUser(payload);
        });
        return Promise.all(updatePromises).then(() => users.length);
      }).then(userCount => {
        if (userCount > 0) {
          this.$modal.msgSuccess(`成功同步仓库权限到 ${userCount} 个用户`);
          this.getList();
        }
        return userCount;
      }).catch(error => {
        console.error('同步仓库权限失败:', error);
        this.$modal.msgError("同步仓库权限失败：" + (error.msg || error.message || '未知错误'));
        throw error;
      });
    },
    /** 将科室权限同步到工作组下的所有用户，返回 Promise */
    syncDepartmentToUsers(postId, departmentIds) {
      return this.getUsersByPostId(postId).then(users => {
        if (!users || users.length === 0) {
          this.$modal.msgWarning("该工作组下没有用户");
          return 0;
        }
        const updatePromises = users.map(userResponse => {
          const userData = userResponse.data;
          const payload = {
            ...userData,
            userId: userData.userId,
            departmentIds: departmentIds,
            workGroupIds: userResponse.workGroupIds || [],
            menuIds: userResponse.menuIds || [],
            warehouseIds: userResponse.warehouseIds || []
          };
          return updateUser(payload);
        });
        return Promise.all(updatePromises).then(() => users.length);
      }).then(userCount => {
        if (userCount > 0) {
          this.$modal.msgSuccess(`成功同步科室权限到 ${userCount} 个用户`);
          this.getList();
        }
        return userCount;
      }).catch(error => {
        console.error('同步科室权限失败:', error);
        this.$modal.msgError("同步科室权限失败：" + (error.msg || error.message || '未知错误'));
        throw error;
      });
    },
    /** 授权弹窗 - 打开（设备系统工作组：合并 group + menuIds + warehouseIds + deptIds） */
    handleAuth(row) {
      this.authOpen = false;
      const groupId = row.postId || row.groupId || row;
      const postName = row.postName || (row && row.groupName) || "";
      this.authTitle = `授权 - ${postName || groupId}`;
      Promise.all([
        getWorkGroup(groupId),
        getWorkGroupMenuIds(groupId),
        getWorkGroupWarehouseIds(groupId),
        getWorkGroupDeptIds(groupId)
      ]).then(([gRes, menuRes, whRes, deptRes]) => {
        const menuIds = menuRes.data || menuRes || [];
        const warehouseIds = whRes.data || whRes || [];
        const departmentIds = deptRes.data || deptRes || [];
        this.authForm = {
          postId: groupId,
          menuIds: Array.isArray(menuIds) ? menuIds : [],
          departmentIds: Array.isArray(departmentIds) ? departmentIds.map(Number) : [],
          warehouseIds: Array.isArray(warehouseIds) ? warehouseIds.map(Number) : [],
          userIdsInGroup: []
        };
        return Promise.all([
          this.getMenuTree(),
          listUserAll({ customerId: this.customerId }).then(res => {
            this.authUserList = res.rows || res.data || res || [];
            return res;
          }),
          listUserIdsByGroupId(groupId).then(res => {
            const ids = res.data || res || [];
            const idList = Array.isArray(ids) ? ids.map(Number) : [];
            this.authForm.userIdsInGroup = idList.filter(id => !isNaN(id));
            this.authInitialGroupUserIds = [...this.authForm.userIdsInGroup];
            return res;
          })
        ]);
      }).then(([menuRes]) => {
        // 获取科室和仓库选项
        // 获取当前登录用户ID（用于获取所有仓库和科室）
        const currentUserId = this.$store?.state?.user?.userId || 1; // 默认使用管理员ID
        return Promise.all([
          // 获取所有仓库
          getWarehouseOptionselect().then(response => {
            console.log('获取仓库列表 - response:', response);
            // 将仓库数据转换为 {id, name} 格式
            const warehouses = response.data || response || [];
            this.userWarehouseOptions = warehouses.map(item => ({
              id: item.id,
              name: item.name
            }));
            console.log('处理后的仓库列表:', this.userWarehouseOptions);
          }).catch(error => {
            console.error('获取仓库列表失败:', error);
            this.userWarehouseOptions = [];
          }),
          // 获取所有科室
          listdepartAll(currentUserId).then(response => {
            console.log('获取科室列表 - response:', response);
            // 将科室数据转换为 {id, name} 格式
            const departments = response || [];
            this.userDepartmentOptions = departments.map(item => ({
              id: item.id,
              name: item.name
            }));
            console.log('处理后的科室列表:', this.userDepartmentOptions);
          }).catch(error => {
            console.error('获取科室列表失败:', error);
            this.userDepartmentOptions = [];
          })
        ]);
      }).then(() => {
        // 确保弹窗打开后再设置菜单树选中状态
        this.authOpen = true;
        // 使用多个 nextTick 确保菜单树完全渲染
        this.$nextTick(() => {
          this.$nextTick(() => {
            if (this.$refs.authMenuTree) {
              const menuIds = (this.authForm.menuIds || []).map(id => String(id)).filter(Boolean);
              this.$refs.authMenuTree.setCheckedKeys(menuIds);
              this.updateAuthMenuCheckState();
              setTimeout(() => {
                if (this.$refs.authMenuTree) {
                  const currentKeys = this.$refs.authMenuTree.getCheckedKeys();
                  if (currentKeys.length !== menuIds.length && menuIds.length > 0) {
                    this.$refs.authMenuTree.setCheckedKeys(menuIds);
                    this.updateAuthMenuCheckState();
                  }
                }
              }, 200);
            } else {
              console.warn('菜单树引用不存在');
            }
          });
        });
      }).catch(error => {
        console.error('打开授权弹窗失败:', error);
        this.$modal.msgError("加载授权数据失败");
      });
    },
    /** 获取菜单树（设备系统用客户已开启的菜单树） */
    getMenuTree() {
      if (this.customerId) {
        return getWorkGroupMenuTree(this.customerId).then(res => {
          const raw = res.data || res || [];
          this.menuOptions = this.mapMenuTree(raw);
          return res;
        });
      }
      return menuTreeselect().then(response => {
        this.menuOptions = response.data || [];
        return response;
      });
    },
    mapMenuTree(nodes) {
      if (!nodes || !nodes.length) return [];
      return nodes.map(m => ({
        id: m.menuId || m.id,
        label: m.menuName || m.label,
        menuType: m.menuType,
        children: this.mapMenuTree(m.children || [])
      }));
    },
    /** 获取所有菜单ID（递归） */
    getAllMenuIds(menuList) {
      let ids = [];
      menuList.forEach(menu => {
        ids.push(menu.id);
        if (menu.children && menu.children.length > 0) {
          ids = ids.concat(this.getAllMenuIds(menu.children));
        }
      });
      return ids;
    },
    /** 授权菜单全选/取消 */
    handleAuthMenuAll(val) {
      if (this.$refs.authMenuTree) {
        if (val) {
          const allMenuIds = this.getAllMenuIds(this.menuOptions);
          this.$refs.authMenuTree.setCheckedKeys(allMenuIds);
          this.authForm.menuIds = allMenuIds;
        } else {
          this.$refs.authMenuTree.setCheckedKeys([]);
          this.authForm.menuIds = [];
        }
        this.updateAuthMenuCheckState();
      }
    },
    /** 授权菜单选择变化 */
    handleAuthMenuCheck(data, checked) {
      const checkedKeys = this.$refs.authMenuTree.getCheckedKeys();
      const halfCheckedKeys = this.$refs.authMenuTree.getHalfCheckedKeys();
      this.authForm.menuIds = checkedKeys;
      this.updateAuthMenuCheckState(checkedKeys, halfCheckedKeys);
    },
    /** 更新授权菜单全选/半选状态 */
    updateAuthMenuCheckState(checkedKeysParam, halfCheckedKeysParam) {
      const checkedKeys = checkedKeysParam || (this.$refs.authMenuTree ? this.$refs.authMenuTree.getCheckedKeys() : []);
      const halfCheckedKeys = halfCheckedKeysParam || (this.$refs.authMenuTree ? this.$refs.authMenuTree.getHalfCheckedKeys() : []);
      const allMenuIds = this.getAllMenuIds(this.menuOptions);
      if (!checkedKeys || checkedKeys.length === 0) {
        this.authMenuCheckAll = false;
        this.authMenuIndeterminate = false;
      } else if (checkedKeys.length === allMenuIds.length) {
        this.authMenuCheckAll = true;
        this.authMenuIndeterminate = false;
      } else {
        this.authMenuCheckAll = false;
        this.authMenuIndeterminate = checkedKeys.length > 0 || halfCheckedKeys.length > 0;
      }
    },
    /** 授权科室权限全选/取消 */
    handleAuthDepartmentAll(val) {
      if (val) {
        this.authForm.departmentIds = this.userDepartmentOptions.map(item => item.id);
      } else {
        this.authForm.departmentIds = [];
      }
    },
    /** 授权仓库权限全选/取消 */
    handleAuthWarehouseAll(val) {
      if (val) {
        this.authForm.warehouseIds = this.userWarehouseOptions.map(item => item.id);
      } else {
        this.authForm.warehouseIds = [];
      }
    },
    /** 用户 tab：勾选/取消「在本组」 */
    toggleAuthUserInGroup(userId, checked) {
      const idx = this.authForm.userIdsInGroup.indexOf(userId);
      if (checked && idx === -1) {
        this.authForm.userIdsInGroup = [...this.authForm.userIdsInGroup, userId];
      } else if (!checked && idx !== -1) {
        this.authForm.userIdsInGroup = this.authForm.userIdsInGroup.filter(id => id !== userId);
      }
    },
    /** 授权提交（设备系统工作组：分别保存菜单/仓库/科室权限 + 用户归属） */
    submitAuth() {
      const groupId = this.authForm.postId;
      const customerId = this.customerId;
      const menuIds = Array.isArray(this.authForm.menuIds)
        ? this.authForm.menuIds.map(id => String(id)).filter(Boolean)
        : [];
      const departmentIds = Array.isArray(this.authForm.departmentIds)
        ? this.authForm.departmentIds.map(id => Number(id)).filter(id => !isNaN(id))
        : [];
      const warehouseIds = Array.isArray(this.authForm.warehouseIds)
        ? this.authForm.warehouseIds.map(id => Number(id)).filter(id => !isNaN(id))
        : [];
      const initialIds = this.authInitialGroupUserIds || [];
      const currentIds = Array.isArray(this.authForm.userIdsInGroup) ? this.authForm.userIdsInGroup : [];
      const addUserIds = currentIds.filter(id => initialIds.indexOf(id) === -1);
      const removeUserIds = initialIds.filter(id => currentIds.indexOf(id) === -1);

      const savePromises = [
        saveWorkGroupMenus(groupId, customerId, menuIds),
        saveWorkGroupWarehouses(groupId, customerId, warehouseIds),
        saveWorkGroupDepts(groupId, customerId, departmentIds)
      ];
      if (addUserIds.length > 0) {
        savePromises.push(addWorkGroupUsers(groupId, addUserIds));
      }
      removeUserIds.forEach(uid => {
        savePromises.push(removeWorkGroupUser(groupId, uid));
      });

      Promise.all(savePromises).then(() => {
        this.getList();
        this.$modal.msgSuccess("授权成功");
        return Promise.all([
          getWorkGroupMenuIds(groupId),
          getWorkGroupWarehouseIds(groupId),
          getWorkGroupDeptIds(groupId)
        ]);
      }).then(([menuRes, whRes, deptRes]) => {
        this.authForm.menuIds = menuRes.data || menuRes || [];
        this.authForm.warehouseIds = whRes.data || whRes || [];
        this.authForm.departmentIds = deptRes.data || deptRes || [];
        this.$nextTick(() => {
          if (this.$refs.authMenuTree) {
            const ids = (this.authForm.menuIds || []).map(id => String(id));
            this.$refs.authMenuTree.setCheckedKeys(ids);
            this.updateAuthMenuCheckState();
          }
        });
      }).catch(err => {
        this.$modal.msgError(err?.msg || err?.message || "保存失败");
      });
    }
  }
};
</script>

<style scoped>
.tree-node-btn {
  color: #909399;
  font-size: 12px;
  margin-right: 4px;
}
/* 授权复选框容器样式 */
.auth-checkbox-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  background-color: #fff;
}

.auth-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
}

.auth-checkbox-item {
  margin-right: 0 !important;
  min-width: 120px;
  font-size: 14px;
}

::v-deep .el-tree {
  background-color: #fff;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 10px;
}

::v-deep .el-tree-node__content {
  height: 32px;
  line-height: 32px;
}

::v-deep .el-tree-node__label {
  font-size: 14px;
}
</style>

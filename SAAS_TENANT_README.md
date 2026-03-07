# spd-sb 设备系统 SaaS 多租户说明

## 一、已完成的改造

### 1. 前端（spd-sb）

- **请求头统一携带租户**  
  在 `src/utils/request.js` 中，所有带 Token 的请求会自动附加：
  - `X-Tenant-Id`：当前租户 ID（customerId）
  - `X-Tenant-Code`：当前租户编码（若有）  
  数据来源：登录后 `getEquipmentInfo` 返回的 `tenant`，存入 Vuex `state.user.tenant`。

- **Store 与 Getter**  
  - `state.user.tenant`：`{ customerId, customerCode, customerName }`  
  - `getters.tenant`：当前租户对象  
  - `getters.customerId`：当前租户 ID，供业务请求、列表参数使用  

- **租户 Mixin**  
  `src/mixins/tenantMixin.js` 提供：
  - `tenant`、`customerId`、`tenantName`、`isTenantUser`  
  业务页引入后可统一使用当前租户，避免手写 `this.$store.state.user.tenant`，保证提交/查询数据归属当前租户。

- **路由与数据完整性**  
  - 若路由配置了 `meta.requireTenant`，且在 GetInfo 后仍无 `tenant`，将提示并跳转登录，避免“无租户”状态下访问需租户的页面。  
  - 登出时清空 `tenant`，避免残留到下一用户。

- **登录与租户**  
  - 登录页客户选择框文案已改为“客户（租户）”，并提示“租户用户必选；平台管理员可留空”。  
  - 租户用户必须在登录时选择客户，后端据此绑定用户与租户。

### 2. 后端（spd）

- **租户上下文与请求头校验**  
  - `TenantContextFilter`（在 JWT 之后执行）：  
    - 将当前登录用户的 `customerId` 写入 `TenantContext`，供业务层通过 `TenantContext.getTenantId()` 使用。  
    - 若请求头带有 `X-Tenant-Id`，则必须与登录用户的 `customerId` 一致，否则返回 403，防止通过篡改请求头访问其他租户。  
  - `SecurityUtils.getCustomerId()`：返回当前登录用户的租户 ID（平台管理员可为 null）。

- **数据隔离原则**  
  - 所有按“租户”隔离的查询、写入，应以 **登录用户所属租户** 为准：  
    - 使用 `SecurityUtils.getCustomerId()` 或 `TenantContext.getTenantId()`。  
  - 不要仅依赖前端传入的 `customerId` 参数做隔离，避免越权。

## 二、不同租户之间的数据隔离

- **已按租户隔离的模块**  
  系统、权限、菜单、工作组等（sb_*、sys_user.customer_id）：  
  已通过 `customerId` 区分租户，列表/保存均按当前用户租户过滤。

- **尚未按租户隔离的业务数据**  
  基础数据与业务表（如 fd_warehouse、fd_material、stk_*、部门/采购/设备等）当前 **没有** `customer_id` 字段，因此库内是多租户混存状态，仅能通过“用户-租户”绑定间接区分。

若要实现 **库表级多租户隔离**，需要：

1. **表结构**  
   在需要隔离的业务表上增加 `customer_id`（或 `tenant_id`），并建索引。

2. **实体与 Mapper**  
   实体增加 `customerId` 字段；查询条件统一加上 `customer_id = #{customerId}`（或从 `TenantContext.getTenantId()` / `SecurityUtils.getCustomerId()` 获取）；新增/更新时写入当前租户 ID。

3. **Service 层**  
   - 列表/查询：从 `SecurityUtils.getCustomerId()` 或 `TenantContext.getTenantId()` 取租户，非平台管理员必须带租户条件。  
   - 新增/修改：若当前用户为租户用户，自动 set 当前租户 ID，禁止写入其他租户。

4. **前端**  
   已通过请求头、getter、mixin 统一传递和展示当前租户；下拉、列表参数尽量使用 `getters.customerId` 或 mixin 的 `customerId`，保证前后端租户一致。

## 三、不同租户用户生产数据完整性补全

- **含义**  
  确保每个租户下的数据完整、可追溯：创建人/修改人、创建时间/修改时间、以及归属租户（customer_id）一致且不为空（对租户用户而言）。

- **已做**  
  - 登录时选定客户，后端将用户与租户绑定；GetInfo/getEquipmentInfo 返回 tenant，前端全局写入 store 并随请求头发送。  
  - 后端对请求头租户与登录用户一致性做校验，避免“拿 A 租户身份改 B 租户数据”。

- **建议补全**  
  1. **业务表**  
     为需隔离的表增加 `customer_id`，并在插入/更新时写入 `SecurityUtils.getCustomerId()`（租户用户必填，平台管理员可为空或按业务约定）。  
  2. **历史数据**  
     对已有数据做一次数据修复：根据业务规则（如创建人所属租户、原“客户”字段等）回填 `customer_id`，并校验唯一性/一致性。  
  3. **唯一性约束**  
     在“业务键 + customer_id”上建唯一约束，避免同一租户内重复、并防止误写其他租户。

按上述方式改造后，spd-sb 设备系统在 SaaS 模式下的 **数据完整性** 和 **不同租户之间的数据隔离**、**不同租户用户生产数据完整性** 将得到统一保障。

---

## 四、租户列表存枚举 + 与租户表关联（按租户条件分支）

### 4.1 代码内租户列表：TenantEnum

- 租户列表存放在 **枚举** `com.spd.common.enums.TenantEnum` 中，每个枚举常量表示一种租户类型，包含：
  - `customerId` / `customerCode`：落库与登录用
  - `branchKey`：业务条件分支标识
  - `displayName`：前端展示
- 枚举的 **name** 存入表 `sb_customer.tenant_key`，实现 **租户表与代码内租户列表关联**。
- 新增租户类型时：在 `TenantEnum` 中增加枚举项，并执行 `sb_customer` 的 `tenant_key` 字段脚本（若尚未加过列则执行一次即可）。

### 4.2 新增租户：从枚举选择

- **前端**：新增客户时必选「租户类型」，选项来自接口 `GET /equipment/system/customer/tenantEnumList`（即 `TenantEnum.toVoList()`）。选择后客户编号、客户编码由枚举带出（可只读）。
- **后端**：新增时必传 `tenantKey`（枚举 name）；校验 `tenantKey` 为合法枚举且未被占用；写入时 `customer_id`/`customer_code` 取自枚举，`tenant_key` 存枚举 name。每个租户类型（枚举常量）只能创建一条客户记录。

### 4.3 业务中按租户做条件分支

- 注入 **TenantRegistry**（`com.spd.framework.tenant.TenantRegistry`）：
  - `getCurrentTenantId()`：当前租户 ID
  - `getCurrentTenantEnum()`：当前租户对应的枚举（通过 sb_customer.tenant_key 或 customerId 解析）
  - `getBranchForCurrentTenant()`：当前租户的 **分支标识**（来自枚举的 branchKey），用于 if/switch
  - `isCurrentTenantBranch("strategyA")`、`isCurrentTenant(TenantEnum.TENANT_A)` 等便于写分支逻辑
- 示例：

```java
@Autowired
private TenantRegistry tenantRegistry;

if (tenantRegistry.isCurrentTenantBranch("strategyA")) {
    // 租户 A 逻辑
} else if (tenantRegistry.isCurrentTenant(TenantEnum.TENANT_B)) {
    // 租户 B 逻辑
}
String branch = tenantRegistry.getBranchForCurrentTenant();
```

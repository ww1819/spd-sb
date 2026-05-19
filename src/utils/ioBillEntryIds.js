/**
 * 出入库明细 stk_io_bill_entry：仓库库存主键（出库/退货/调拨等）
 * 优先 stkInventoryId；兼容旧数据仅 kc_no 且未写 depInventoryId 时视为仓库行。
 */
export function ioEntryWhInvId(e) {
  if (!e) return null
  if (e.stkInventoryId != null && e.stkInventoryId !== '') return e.stkInventoryId
  if (e.depInventoryId != null && e.depInventoryId !== '') return null
  return e.kcNo != null && e.kcNo !== '' ? e.kcNo : null
}

/**
 * 科室库存主键（退库、出库收货确认等）
 * 优先 depInventoryId；否则兼容旧 kc_no。
 */
export function ioEntryDepInvId(e) {
  if (!e) return null
  if (e.depInventoryId != null && e.depInventoryId !== '') return e.depInventoryId
  return e.kcNo != null && e.kcNo !== '' ? e.kcNo : null
}

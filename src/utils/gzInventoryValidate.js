/**
 * 高值库存校验失败（HTTP 业务码 602）弹窗展示
 * @param {Vue} vm 组件实例（需含 $alert）
 * @param {object} res 后端 AjaxResult：{ code, msg, data: [{ lineNo, inHospitalCode, batchNo, materialName, reason }] }
 */
export function showGzInventoryValidateDialog(vm, res) {
  if (!vm || !res || res.code !== 602 || !res.data || !res.data.length) {
    return false
  }
  const rows = res.data
  let html = '<div style="max-height:360px;overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">'
  html += '<thead><tr style="background:#f5f7fa"><th style="border:1px solid #ebeef5;padding:6px">行号</th><th style="border:1px solid #ebeef5;padding:6px">耗材</th><th style="border:1px solid #ebeef5;padding:6px">院内码</th><th style="border:1px solid #ebeef5;padding:6px">批次</th><th style="border:1px solid #ebeef5;padding:6px">原因</th></tr></thead><tbody>'
  rows.forEach((r) => {
    html += '<tr>'
    html += `<td style="border:1px solid #ebeef5;padding:6px">${r.lineNo != null ? r.lineNo : '--'}</td>`
    html += `<td style="border:1px solid #ebeef5;padding:6px">${escapeHtml(r.materialName || '')}</td>`
    html += `<td style="border:1px solid #ebeef5;padding:6px">${escapeHtml(r.inHospitalCode || '')}</td>`
    html += `<td style="border:1px solid #ebeef5;padding:6px">${escapeHtml(r.batchNo || '')}</td>`
    html += `<td style="border:1px solid #ebeef5;padding:6px">${escapeHtml(r.reason || '')}</td>`
    html += '</tr>'
  })
  html += '</tbody></table></div>'
  vm.$alert(html, res.msg || '库存校验未通过', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭'
  })
  return true
}

function escapeHtml(s) {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * axios 错误响应中解析 602
 */
export function tryShowGzInventoryError(vm, err) {
  if (err && err.code === 602 && err.data) {
    showGzInventoryValidateDialog(vm, err)
    return true
  }
  const res = err && err.response && err.response.data
  if (res && res.code === 602) {
    showGzInventoryValidateDialog(vm, res)
    return true
  }
  return false
}

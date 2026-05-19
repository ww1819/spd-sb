/**
 * 低值耗材引用数量校验（业务码 603）弹窗
 * data: [{ lineNo, materialName, reason, maxRefQty, currentQty }]
 */
export function showDocRefQtyValidateDialog(vm, res) {
  if (!vm || !res || res.code !== 603 || !res.data || !res.data.length) {
    return false
  }
  const rows = res.data
  let html = '<div style="max-height:360px;overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">'
  html += '<thead><tr style="background:#f5f7fa"><th style="border:1px solid #ebeef5;padding:6px">行号</th>'
  html += '<th style="border:1px solid #ebeef5;padding:6px">耗材</th>'
  html += '<th style="border:1px solid #ebeef5;padding:6px">当前数量</th>'
  html += '<th style="border:1px solid #ebeef5;padding:6px">最多可引用</th>'
  html += '<th style="border:1px solid #ebeef5;padding:6px">原因</th></tr></thead><tbody>'
  rows.forEach((r) => {
    html += '<tr>'
    html += `<td style="border:1px solid #ebeef5;padding:6px">${r.lineNo != null ? r.lineNo : '--'}</td>`
    html += `<td style="border:1px solid #ebeef5;padding:6px">${escapeHtml(r.materialName || '')}</td>`
    html += `<td style="border:1px solid #ebeef5;padding:6px">${escapeHtml(r.currentQty != null ? String(r.currentQty) : '')}</td>`
    html += `<td style="border:1px solid #ebeef5;padding:6px">${escapeHtml(r.maxRefQty != null ? String(r.maxRefQty) : '--')}</td>`
    html += `<td style="border:1px solid #ebeef5;padding:6px">${escapeHtml(r.reason || '')}</td>`
    html += '</tr>'
  })
  html += '</tbody></table></div>'
  vm.$alert(html, res.msg || '引用数量校验未通过', {
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

export function tryShowDocRefQtyError(vm, err) {
  if (err && err.code === 603 && err.data) {
    showDocRefQtyValidateDialog(vm, err)
    return true
  }
  const res = err && err.response && err.response.data
  if (res && res.code === 603) {
    showDocRefQtyValidateDialog(vm, res)
    return true
  }
  return false
}

<template>
  <div class="order-print receipt-print" ref="receiptOrderPrintRef" hidden="hidden">
    <!-- 标题：医院名称 + 物资入库单 -->
    <div class="doc-title">
      <span v-if="hospitalName">{{ hospitalName }}</span>物资入库单
    </div>

    <!-- 基本信息区 -->
    <div class="info-block">
      <div class="info-row">
        <span class="info-label">单据号</span>
        <span class="info-value">{{ row.billNo || '' }}</span>
        <span class="info-label info-gap">供货商</span>
        <span class="info-value info-value-wide">{{ row.supplierName || '' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">入库日期</span>
        <span class="info-value">{{ formatInboundDate(row.billDate) }}</span>
        <span class="info-label info-gap">资金来源账户</span>
        <span class="info-value">{{ row.fundSourceAccount || '' }}</span>
      </div>
    </div>

    <!-- 耗材明细表：消耗品名称、规格、单位、数量、采购价、采购金额、产地 -->
    <table class="detail-table">
      <thead>
        <tr>
          <th>消耗品名称</th>
          <th>规格</th>
          <th>单位</th>
          <th>数量</th>
          <th>采购价</th>
          <th>采购金额</th>
          <th>产地</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in (row.detailList || [])" :key="idx">
          <td>{{ item.materialName || '' }}</td>
          <td>{{ item.materialSpeci || '' }}</td>
          <td>{{ item.unitName || '' }}</td>
          <td>{{ formatNum(item.qty) }}</td>
          <td>{{ formatPrice(item.unitPrice != null ? item.unitPrice : item.price) }}</td>
          <td>{{ formatAmt(item.amt) }}</td>
          <td>{{ item.factoryName || '' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 合计：左侧“合计: 贰仟柒佰元”，右侧数字与采购金额列对齐 -->
    <div class="total-row">
      <span class="total-left">合计: {{ row.totalAmtConverter || '' }}</span>
      <span class="total-num">{{ row.totalAmt != null ? row.totalAmt : '' }}</span>
    </div>

    <!-- 签字区：采购、保管、入库操作员 -->
    <div class="sign-block">
      <span class="sign-item">采购</span>
      <span class="sign-item">保管</span>
      <span class="sign-item">入库操作员 {{ row.inboundOperator || row.createBy || '' }}</span>
    </div>
  </div>
</template>

<script>
import hospitalNameMixin from '@/mixins/hospitalNameMixin'

export default {
  mixins: [hospitalNameMixin],
  props: ['row'],
  methods: {
    /** 入库日期格式：yyyyMMddHH:mm:ss，与参考样张一致 */
    formatInboundDate(val) {
      if (!val) return ''
      const d = new Date(val)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      const s = String(d.getSeconds()).padStart(2, '0')
      return `${y}${m}${day}${h}:${min}:${s}`
    },
    formatNum(v) {
      if (v == null || v === '') return ''
      const n = Number(v)
      return isNaN(n) ? v : n.toFixed(2)
    },
    formatPrice(v) {
      if (v == null || v === '') return ''
      const n = Number(v)
      return isNaN(n) ? v : n.toFixed(4)
    },
    formatAmt(v) {
      if (v == null || v === '') return ''
      const n = Number(v)
      return isNaN(n) ? v : String(Math.round(n))
    },
    start() {
      const doPrint = () => {
        this.$nextTick(() => {
          const el = this.$refs.receiptOrderPrintRef || this.$el
          if (!el) return
          if (typeof this.$print === 'function') {
            this.$print(el, {}, 'A4')
          } else {
            try {
              window.print()
            } catch (e) {
              console.error('打印失败:', e)
            }
          }
        })
      }
      if (typeof this.ensureHospitalNameLoaded === 'function') {
        this.ensureHospitalNameLoaded().then(doPrint).catch(doPrint)
      } else {
        doPrint()
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.receipt-print
  padding 16px 20px
  line-height 1.5
  font-size 14px
  max-width 800px
  margin 0 auto

.doc-title
  font-size 22px
  font-weight bold
  text-align center
  margin-bottom 16px

.info-block
  margin-bottom 12px

.info-row
  display flex
  align-items center
  flex-wrap wrap
  margin-bottom 6px

.info-label
  min-width 90px
  flex-shrink 0

.info-value
  min-width 140px
  margin-right 24px

.info-value-wide
  flex 1
  min-width 200px

.info-gap
  margin-left 24px

.detail-table
  width 100%
  table-layout fixed
  border-collapse collapse
  border 1px solid #000
  margin-bottom 10px

.detail-table th,
.detail-table td
  border 1px solid #000
  padding 6px 8px
  text-align center
  font-size 13px

.detail-table th
  font-weight bold
  background #f5f5f5

.detail-table td
  word-break break-all
  overflow hidden

.total-row
  display flex
  justify-content space-between
  align-items center
  margin-bottom 14px
  font-size 14px

.total-left
  flex-shrink 0

.total-num
  min-width 80px
  text-align right

.sign-block
  display flex
  justify-content space-between
  padding-right 20%
  font-size 14px

.sign-item
  min-width 80px
</style>

<style lang="stylus" media="print">
@page
  size auto
  margin 12mm

@media print
  *
    color #000 !important

  .receipt-print
    width 100% !important
    max-width none
    padding 0
    font-size 14px

  .doc-title
    font-size 22px

  .detail-table
    width 100% !important
    table-layout fixed
    border-collapse collapse

  .detail-table th,
  .detail-table td
    border 1px solid #000
    font-size 12px
    overflow hidden
    word-wrap break-word
    word-break break-all

  .detail-table th
    background #f5f5f5 !important
    -webkit-print-color-adjust exact
    print-color-adjust exact
</style>

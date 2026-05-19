import RMBConverter from "@/utils/tools";

export function buildGzAcceptancePrintRowFromDetail(summaryRow, detailData) {
  const summary = summaryRow || {};
  const data = detailData || {};
  const details = Array.isArray(data.gzOrderEntryList) ? data.gzOrderEntryList : [];
  const materialList = Array.isArray(data.materialList) ? data.materialList : [];

  const materialMap = {};
  materialList.forEach((it) => {
    if (it && it.id != null) {
      materialMap[it.id] = it;
    }
  });

  let totalAmt = 0;
  let totalQty = 0;
  const detailList = details.map((item) => {
    const line = item || {};
    const qty = Number(line.qty) || 0;
    const amt = Number(line.amt) || 0;
    totalQty += qty;
    totalAmt += amt;
    const prod = materialMap[line.materialId] || {};
    return {
      batchNumber: line.batchNumber || "",
      amt: line.amt,
      qty: line.qty,
      price: line.price,
      materialCode: prod.code || "",
      materialName: prod.name || "",
      materialSpeci: prod.speci || "",
      periodDate: prod.periodDate || "",
      factoryName: (prod.fdFactory && prod.fdFactory.factoryName) || "",
      warehouseCategoryName: (prod.fdWarehouseCategory && prod.fdWarehouseCategory.warehouseCategoryName) || ""
    };
  });

  return {
    orderNo: summary.orderNo || data.orderNo || "",
    supplierName: (summary.supplier && summary.supplier.name) || "",
    warehouseName: (summary.warehouse && summary.warehouse.name) || "",
    orderDate: summary.orderDate || data.orderDate || "",
    auditDate: summary.auditDate || data.auditDate || "",
    totalAmt: totalAmt,
    totalQty: totalQty,
    totalAmtConverter: RMBConverter.numberToChinese(totalAmt),
    detailList: detailList
  };
}

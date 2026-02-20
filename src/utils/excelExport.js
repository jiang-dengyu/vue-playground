import * as XLSX from 'xlsx';

/**
 * 純資料匯出 (不更動欄位結構，僅處理檔案產生)
 * @param {Array} data - 要匯出的 JSON 陣列
 * @param {String} fileNamePrefix - 檔名前綴 (例如：項目_歷代祖先)
 */
export const exportRawData = (data, fileNamePrefix = '法會報名名單') => {
  if (!data || data.length === 0) {
    alert('目前沒有資料可匯出');
    return;
  }

  // 1. 將 JSON 轉為工作表 (保持原始欄位)
  // 如果想要 Excel 標題是中文，可以在 map 裡定義轉換，
  // 若不需要變更，直接傳入 data 即可。
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. 建立工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // 3. 檔名加上日期
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
};
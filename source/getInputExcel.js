async function extractPatternAndValues(arrayBuffer, skip = 2) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet(1); // Làm việc với sheet đầu tiên
  // skip = skip + 1; // Bắt đầu từ dòng skip + 1
  const patterns = [];
  const valuesList = [];

  // Lấy danh sách pattern từ dòng chỉ định (skip)
  worksheet.getRow(2).eachCell((cell, colNumber) => {
    patterns[colNumber] = cell.value; // Lưu pattern theo số cột (colNumber)
  });

  // Lấy các dòng từ dòng (skip + 1) trở đi (giá trị tương ứng)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > skip) {
      const rowObject = {};

      row.eachCell((cell, colNumber) => {
        const pattern = patterns[colNumber]; // Lấy pattern theo cột
        if (pattern) {
          rowObject[pattern] = cell.value || ""; // Lấy giá trị nếu có pattern
        }
      });

      if (Object.keys(rowObject).length > 0) {
        valuesList.push(rowObject);
      }
    }
  });

  return valuesList;
}

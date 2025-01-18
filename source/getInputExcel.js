async function extractPatternAndValues(arrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet(1); // Làm việc với sheet đầu tiên

  const patterns = [];
  const valuesList = [];

  // Lấy danh sách pattern từ dòng 2
  worksheet.getRow(2).eachCell((cell, colNumber) => {
    patterns[colNumber] = cell.value; // Lưu pattern theo số cột (colNumber)
  });

  // Lấy các dòng từ dòng 3 trở đi (giá trị tương ứng)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
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

async function mergeFilesIntoSingleWorkbook(fileConfigs, outputFileName) {
  try {
    const workbook = new ExcelJS.Workbook(); // Workbook tổng hợp

    for (const config of fileConfigs) {
      const templateWorkbook = new ExcelJS.Workbook();
      await templateWorkbook.xlsx.load(config.templateArrayBuffer);

      const templateSheet = templateWorkbook.getWorksheet(1);

      // Đảm bảo tên sheet là duy nhất
      let sheetName = config.fileName || "Sheet";
      let uniqueName = sheetName;
      let counter = 1;
      while (workbook.getWorksheet(uniqueName)) {
        uniqueName = `${sheetName}_${counter}`;
        counter++;
      }

      // Tạo sheet mới trong workbook tổng hợp
      const newSheet = workbook.addWorksheet(uniqueName);

      // Sao chép dữ liệu từ templateSheet sang newSheet
      templateSheet.eachRow((row, rowIndex) => {
        const newRow = newSheet.getRow(rowIndex);
        row.eachCell((cell, colIndex) => {
          const newCell = newRow.getCell(colIndex);
          newCell.value = cell.value;
          newCell.style = { ...cell.style }; // Sao chép định dạng
        });

        // Sao chép chiều cao của hàng
        if (row.height) {
          newRow.height = row.height;
        }
      });

      // Sao chép chiều rộng cột
      templateSheet.columns.forEach((col, colIndex) => {
        if (col && col.width) {
          newSheet.getColumn(colIndex + 1).width = col.width;
        }
      });

      // Sao chép các vùng ô hợp nhất
      if (templateSheet.mergedCells) {
        templateSheet.mergedCells.forEach((mergedRange) => {
          newSheet.mergeCells(mergedRange);
        });
      }
    }

    // Lưu workbook thành file duy nhất
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Tải file
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputFileName || "Merged_Files.xlsx";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error("Error merging files:", error);
    alert("Đã xảy ra lỗi trong quá trình hợp nhất file!");
  }
}

async function updateExcelTemplate(
  templateArrayBuffer, // Change to accept ArrayBuffer instead of path
  feeTable,
  patterns,
  values,
  fileName
) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateArrayBuffer); // Load from ArrayBuffer
    const worksheet = workbook.getWorksheet(1);

    let startRow = null;
    let startCol = null;

    // Tìm vị trí của pattern <hoc_phi> để điền feeTable
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (cell.value === "<hoc_phi>") {
          startRow = rowNumber;
          startCol = colNumber;
        }

        // Tìm và thay thế các pattern khác
        if (cell.value && typeof cell.value === "string") {
          patterns.forEach((pattern, index) => {
            if (cell.value.includes(pattern)) {
              cell.value = cell.value.replace(pattern, values[index] || ""); // Thay thế bằng giá trị tương ứng
            }
          });
        }
      });
    });

    if (startRow === null || startCol === null) {
      console.error("Pattern <hoc_phi> not found in the template!");
      return;
    }

    // Điền dữ liệu feeTable vào worksheet
    feeTable.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const cell = worksheet.getCell(
          startRow + rowIndex,
          startCol + colIndex
        );
        cell.value = value;

        // Nếu là dòng tổng, áp dụng định dạng đặc biệt
        if (rowIndex === feeTable.length - 1) {
          cell.font = {
            bold: true, // Đậm chữ
            size: 11, // Cỡ chữ
          };
          cell.alignment = { horizontal: "left" }; // Canh trái
        }

        // Sao chép định dạng từ ô <hoc_phi> ban đầu nếu không phải dòng tổng
        if (rowIndex !== feeTable.length - 1) {
          const templateCell = worksheet.getCell(startRow, startCol);
          cell.style = { ...templateCell.style };
        }
      });
    });

    // Đặt chiều rộng tối thiểu cho các cột (15px)
    const columnCount = feeTable[0].length; // Số cột trong bảng
    for (let i = 0; i < columnCount; i++) {
      const column = worksheet.getColumn(startCol + i); // Lấy cột hiện tại
      column.width = 15; // Đặt chiều rộng tối thiểu là 15px
    }
    const buffer = await workbook.xlsx.writeBuffer();

    // Create blob from buffer
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Trigger download
    triggerDownload(blob, fileName);
  } catch (e) {
    document.querySelector(".message").innerHTML =
      "<p> Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại hoặc kiểm tra file data hoặc template.</p>";
  }
}

// Hàm hỗ trợ tải xuống file
function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName + ".xlsx";
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000); // Giãn cách để đảm bảo trình duyệt xử lý hoàn tất
}

// Hàm chính để xử lý nhiều file tải xuống tuần tự
async function downloadMultipleFiles(fileConfigs) {
  for (const config of fileConfigs) {
    await updateExcelTemplate(
      config.templateArrayBuffer,
      config.feeTable,
      config.patterns,
      config.values,
      config.fileName
    );
  }
}

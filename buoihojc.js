const calculateSessionsForMultipleDays = (startDate, endDate, weekdays) => {
  const sessions = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (weekdays.includes(currentDate.getDay())) {
      sessions.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sessions;
};

const generateFeeTable = (
  startDate,
  weekdays,
  feePerSession,
  monthsToProcess = 2,
  holidays = [] // Mảng ngày nghỉ
) => {
  const start = new Date(startDate);
  const table = [["Tháng"]];
  let totalSessions = 0;
  let totalFee = 0;

  for (let i = 0; i < monthsToProcess; i++) {
    const currentMonthStart = new Date(
      start.getFullYear(),
      start.getMonth() + i,
      1
    );
    const currentMonthEnd = new Date(
      currentMonthStart.getFullYear(),
      currentMonthStart.getMonth() + 1,
      0
    );

    if (currentMonthStart.getTime() > new Date(start).getTime() && i === 0)
      continue;

    const sessions =
      i === 0
        ? [
            start,
            ...calculateSessionsForMultipleDays(
              new Date(start.getTime() + 1),
              currentMonthEnd,
              weekdays
            ),
          ]
        : calculateSessionsForMultipleDays(
            currentMonthStart,
            currentMonthEnd,
            weekdays
          );

    // Đánh dấu ngày nghỉ
    const sessionsWithHolidays = sessions.map((session) => {
      const isHoliday = holidays.some(
        (holiday) =>
          holiday.toLocaleDateString("vi-VN") ===
          session.toLocaleDateString("vi-VN")
      );
      return isHoliday
        ? session.toLocaleDateString("vi-VN") + " (Ngày nghỉ)"
        : session.toLocaleDateString("vi-VN");
    });

    const effectiveSessions = sessions.filter(
      (session) =>
        !holidays.some(
          (holiday) =>
            holiday.toLocaleDateString("vi-VN") ===
            session.toLocaleDateString("vi-VN")
        )
    );

    const monthFee =
      (effectiveSessions.length - (i === 0 ? 1 : 0)) * feePerSession;
    totalSessions += effectiveSessions.length - (i === 0 ? 1 : 0);
    totalFee += monthFee;

    table.push([
      `Tháng ${
        currentMonthStart.getMonth() + 1
      }/${currentMonthStart.getFullYear()}`,
      i === 0
        ? sessionsWithHolidays[0] + " (Học thử)"
        : sessionsWithHolidays[0] || "",
      ...sessionsWithHolidays.slice(1),
      "Số buổi: " + effectiveSessions.length,
      `Tổng tiền tháng ${currentMonthStart.getMonth() + 1}: ` +
        monthFee.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    ]);
  }

  table.push([
    "Tổng số buổi: " + totalSessions,
    "",
    "",
    "",
    "Tổng học phí: " +
      totalFee.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
  ]);

  return table;
};

const processWeekdays = (weekdayString) => {
  // Map of day names to numbers (0 = Sunday)
  const dayMap = {
    CN: 0,
    T2: 1,
    T3: 2,
    T4: 3,
    T5: 4,
    T6: 5,
    T7: 6,
  };

  // Handle range case ("T2 đến T7")
  if (weekdayString.includes("to")) {
    const [start, _, end] = weekdayString.split(" ");
    const startNum = dayMap[start];
    const endNum = dayMap[end];
    return Array.from(
      { length: endNum - startNum + 1 },
      (_, i) => startNum + i
    );
  }

  // Handle individual days case ("T2 T3")
  return weekdayString.split(" ").map((day) => dayMap[day]);
};

var x = processWeekdays("T2 to T7"); // [1, 2, 3, 4, 5, 6]
console.log(x);

// Example usage:

// const patterns = ["<class_name>", "<money>", "<expried>", "<time>"];
// const values = [
//   "Lớp Toán A",
//   "115,000 VND",
//   "M10 hàng tháng",
//   "T2 đến T7 hàng tuần",
// ];

// (async () => {
//   const templatePath = "./Phieuthu.xlsx"; // Đường dẫn file mẫu
//   const outputPath = "C://Users/admin/Downloads/Omnilogin"; // Đường dẫn file kết quả
//   const filePath = "./Book1 (1).xlsx";
//   var x = await extractPatternAndValues(filePath);
//   x.forEach(async (element, index) => {
//     var fileName = "Phiếu thu học phí " + element["<student_name>"];
//     var { patterns, values } = convertToPatternsAndValues(element);
//     await updateExcelTemplate(
//       templatePath,
//       outputPath,
//       feeTable,
//       patterns,
//       values,
//       fileName
//     ).catch(console.error);
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//   });
// })();

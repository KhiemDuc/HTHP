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

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    while (chunk.length < size) {
      chunk.push(""); // Thêm ô rỗng nếu chưa đủ 4 phần tử
    }
    result.push(chunk);
  }
  return result;
};

const generateFeeTable = (
  trialDate,
  startDate,
  weekdays,
  feePerSession,
  endDate,
  holidays = [], // Mảng ngày nghỉ,
  startrange
) => {
  const trial = new Date(trialDate);

  var startRange = new Date(startrange);

  var start = new Date(startDate);

  if (startRange > start) {
    start = startRange;
  }
  const end = new Date(endDate);

  const table = [["Tháng", "", "", "", "", "Số Buổi", "Học Phí"]];
  let totalSessions = 0;
  let totalFee = 0;

  // Hàm tính toán các buổi học trong khoảng thời gian nhất định
  const calculateSessionsForMultipleDays = (start, end, weekdays) => {
    const sessions = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (weekdays.includes(d.getDay())) {
        sessions.push(new Date(d));
      }
    }
    return sessions;
  };

  let currentMonthStart = new Date(start.getFullYear(), start.getMonth(), 1);

  while (currentMonthStart <= end) {
    const currentMonthEnd = new Date(
      currentMonthStart.getFullYear(),
      currentMonthStart.getMonth() + 1
    );
    let sessions;
    if (!isNaN(trial.getTime())) {
      sessions =
        currentMonthStart.getMonth() === start.getMonth() &&
        currentMonthStart.getFullYear() === start.getFullYear()
          ? [
              trial,
              ...calculateSessionsForMultipleDays(
                new Date(start.getTime() + 1),
                Math.min(currentMonthEnd, end),
                weekdays
              ),
            ]
          : calculateSessionsForMultipleDays(
              currentMonthStart,
              Math.min(currentMonthEnd, end),
              weekdays
            );
    } else {
      sessions =
        currentMonthStart.getMonth() === start.getMonth() &&
        currentMonthStart.getFullYear() === start.getFullYear()
          ? [
              ...calculateSessionsForMultipleDays(
                new Date(start.getTime() + 1),
                Math.min(currentMonthEnd, end),
                weekdays
              ),
            ]
          : calculateSessionsForMultipleDays(
              currentMonthStart,
              Math.min(currentMonthEnd, end),
              weekdays
            );
    }

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
        ) && session.getTime() !== trial.getTime()
    );

    const monthFee = effectiveSessions.length * feePerSession;
    totalSessions += effectiveSessions.length;
    totalFee += monthFee;

    const row = []; // Dòng đầu tiên

    let checkTrial = false;
    if (
      currentMonthStart.getMonth() === trial.getMonth() &&
      currentMonthStart.getFullYear() === trial.getFullYear()
    ) {
      checkTrial = true;
    }

    // Nếu có buổi học thử, bỏ phần tử đầu tiên
    const sessionsToProcess = checkTrial
      ? sessionsWithHolidays.slice(1)
      : sessionsWithHolidays;

    // Hàm chia mảng thành từng nhóm 4 phần tử
    // const chunkArray = (array, size) => {
    //   const result = [];
    //   for (let i = 0; i < array.length; i += size) {
    //     result.push(array.slice(i, i + size));
    //   }
    //   return result;
    // };

    const firstRowSessions = sessionsToProcess.slice(0, 4);

    while (firstRowSessions.length < 4) {
      firstRowSessions.push(""); // Đảm bảo luôn có 4 phần tử
    }

    // **Dòng đầu tiên** (Tháng + 4 buổi đầu tiên + Số buổi + Tổng tiền)
    const firstRow = [
      `Tháng ${
        currentMonthStart.getMonth() + 1
      }/${currentMonthStart.getFullYear()}`,
      ...firstRowSessions, // Lấy tối đa 4 buổi đầu tiên
      "" + effectiveSessions.length,
      // `Tổng tiền tháng ${currentMonthStart.getMonth() + 1}: ` +
      monthFee.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    ];

    table.push(firstRow); // Đẩy dòng đầu tiên vào bảng

    // **Những buổi còn lại** (chia thành nhóm 4 phần tử)
    const remainingSessions = sessionsToProcess.slice(4);
    const formattedSessions = chunkArray(remainingSessions, 4);

    // Đẩy từng nhóm vào bảng (tối đa 4 phần tử mỗi dòng)
    formattedSessions.forEach((group) => {
      table.push(["", ...group, "", ""]); // Đẩy dòng vào bảng
    });

    currentMonthStart = new Date(
      currentMonthStart.getFullYear(),
      currentMonthStart.getMonth() + 1,
      1
    );
  }

  table.push([
    "Tổng số buổi: " + totalSessions,
    "",
    "",
    "",
    "",
    "",
    "Tổng học phí: " +
      totalFee.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
  ]);

  return table.slice(1); // Loại bỏ dòng "Tháng" ở đầu
};

// Test function
const testGenerateFeeTable = () => {
  let trialDate;
  const startDate = "2025-01-15";
  const endDate = "2025-02-05";
  const weekdays = [1, 2, 3, 4]; // Thứ 2, 4, 6
  const feePerSession = 100000; // 100,000 VND mỗi buổi
  const holidays = []; // Các ngày nghỉ

  const table = generateFeeTable(
    trialDate,
    startDate,
    weekdays,
    feePerSession,
    endDate,
    holidays
  );

  console.log("Bảng học phí:");
  table.forEach((row) => console.log(row.join(" | ")));
};

testGenerateFeeTable();

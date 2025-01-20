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
  trialDate,
  startDate,
  weekdays,
  feePerSession,
  endDate,
  holidays = [] // Mảng ngày nghỉ
) => {
  const trial = new Date(trialDate);
  const start = new Date(startDate);
  const end = new Date(endDate);
  const table = [["Tháng"]];
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

    const sessions =
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

    const row = [
      `Tháng ${
        currentMonthStart.getMonth() + 1
      }/${currentMonthStart.getFullYear()}`,
    ];
    let checkTrial = false;
    if (
      currentMonthStart.getMonth() === start.getMonth() &&
      currentMonthStart.getFullYear() === start.getFullYear()
    ) {
      row.push(trial.toLocaleDateString("vi-VN") + " (Học thử)");
      checkTrial = true;
    }

    if (checkTrial) {
      row.push(
        ...sessionsWithHolidays.slice(1),
        "Số buổi: " + effectiveSessions.length,
        `Tổng tiền tháng ${currentMonthStart.getMonth() + 1}: ` +
          monthFee.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })
      );
    } else {
      row.push(
        ...sessionsWithHolidays,
        "Số buổi: " + effectiveSessions.length,
        `Tổng tiền tháng ${currentMonthStart.getMonth() + 1}: ` +
          monthFee.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })
      );
    }

    table.push(row);

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
    "Tổng học phí: " +
      totalFee.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
  ]);

  return table;
};

// Test function
const testGenerateFeeTable = () => {
  const trialDate = "2025-01-01";
  const startDate = "2025-01-03";
  const endDate = "2025-02-10";
  const weekdays = [1, 3, 5]; // Thứ 2, 4, 6
  const feePerSession = 100000; // 100,000 VND mỗi buổi
  const holidays = [new Date("2025-01-15"), new Date("2025-02-05")]; // Các ngày nghỉ

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

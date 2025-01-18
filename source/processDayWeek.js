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

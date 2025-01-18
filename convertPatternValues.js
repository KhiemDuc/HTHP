function convertToPatternsAndValues(object) {
  const patterns = [];
  const values = [];

  for (const [key, value] of Object.entries(object)) {
    patterns.push(key); // Thêm key vào mảng patterns
    values.push(value); // Thêm value vào mảng values
  }

  console.log("Patterns:", patterns);
  console.log("Values:", values);

  return { patterns, values };
}

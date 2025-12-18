function getGreetingByTime(date = new Date()) {
  // Convert to Indian Time (IST)
  const indiaTime = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const hour = indiaTime.getHours();


  if (hour >= 4 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  if (hour >= 17 && hour < 22) {
    return "Good Evening";
  }

  return "Good Night";
}

module.exports = { getGreetingByTime };
